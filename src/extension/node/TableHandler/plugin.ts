import type { Editor } from '@tiptap/core';
import type { Node as TiptapNode } from '@tiptap/pm/model';
import type { EditorState, PluginView, Transaction } from '@tiptap/pm/state';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import {
  CellSelection,
  moveTableColumn,
  moveTableRow,
  TableMap,
} from '@tiptap/pm/tables';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import {
  clamp,
  domCellAround,
  getCellIndicesFromDOM,
  getColumnCells,
  getIndexCoordinates,
  getRowCells,
  getTableFromDOM,
  isHTMLElement,
  isTableNode,
  safeClosest,
  selectCellsByCoords,
} from '../../../util/table-utils';
import { createTableDragImage } from './create-image';

export type TableHandlesState = {
  show: boolean;
  showAddOrRemoveRowsButton: boolean;
  showAddOrRemoveColumnsButton: boolean;
  referencePosCell?: DOMRect;
  referencePosTable: DOMRect;
  referencePosLastRow?: DOMRect; // 扩展按钮使用的末行位置
  referencePosLastCol?: DOMRect; // 扩展按钮使用的末列位置
  block: TiptapNode;
  blockPos: number;
  colIndex: number | undefined;
  rowIndex: number | undefined;
  draggingState?:
  | {
    draggedCellOrientation: 'row' | 'col';
    originalIndex: number;
    mousePos: number;
    initialOffset: number;
    originalCellSize?: { width: number; height: number }; // 拖拽时保持初始单元格尺寸
  }
  | undefined;
  widgetContainer: HTMLElement | undefined;
  // 缓存手柄元素的边界矩形，避免重复计算
  _cachedHandleRects?: DOMRect[];
  _cachedHandleRectsTime?: number;
};

function hideElements(selector: string, rootEl: Document | ShadowRoot) {
  rootEl.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    el.style.visibility = 'hidden';
  });
}

export const tableHandlePluginKey = new PluginKey('tableHandlePlugin');

class TableHandleView implements PluginView {
  public editor: Editor;
  public editorView: EditorView;

  public state: TableHandlesState | undefined = undefined;
  public menuFrozen = false;
  public mouseState: 'up' | 'down' | 'selecting' = 'up';
  public tableId: string | undefined;
  public tablePos: number | undefined;
  public tableElement: HTMLElement | undefined;

  public emitUpdate: () => void;

  constructor(
    editor: Editor,
    editorView: EditorView,
    emitUpdate: (state: TableHandlesState) => void
  ) {
    this.editor = editor;
    this.editorView = editorView;
    this.emitUpdate = () => this.state && emitUpdate(this.state);

    this.editorView.dom.addEventListener('mousemove', this.mouseMoveHandler);
    this.editorView.dom.addEventListener('mousedown', this.viewMousedownHandler);
    window.addEventListener('mouseup', this.mouseUpHandler);

    this.editorView.root.addEventListener(
      'dragover',
      this.dragOverHandler as EventListener
    );
    this.editorView.root.addEventListener(
      'drop',
      this.dropHandler as unknown as EventListener
    );

    // 监听滚动事件以更新手柄位置
    window.addEventListener('scroll', this.scrollHandler, true);
    // 同时监听窗口尺寸变化
    window.addEventListener('resize', this.scrollHandler);
  }

  private viewMousedownHandler = (event: MouseEvent) => {
    this.mouseState = 'down';

    const { state, view } = this.editor;
    if (!(state.selection instanceof CellSelection) || this.editor.isFocused)
      return;

    const posInfo = view.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    });
    if (!posInfo) return;

    const $pos = state.doc.resolve(posInfo.pos);
    const { nodes } = state.schema;
    let paraDepth = -1;
    let inTableCell = false;

    for (let d = $pos.depth; d >= 0; d--) {
      const node = $pos.node(d);
      if (
        !inTableCell &&
        (node.type === nodes.tableCell || node.type === nodes.tableHeader)
      ) {
        inTableCell = true;
      }
      if (paraDepth === -1 && node.type === nodes.paragraph) {
        paraDepth = d;
      }
      if (inTableCell && paraDepth !== -1) break;
    }

    if (!inTableCell || paraDepth === -1) return;

    const from = $pos.start(paraDepth);
    const to = $pos.end(paraDepth);
    const nextSel = TextSelection.create(state.doc, from, to);
    if (state.selection.eq(nextSel)) return;

    view.dispatch(state.tr.setSelection(nextSel));
    view.focus();
  };

  private mouseUpHandler = (event: MouseEvent) => {
    this.mouseState = 'up';
    this.mouseMoveHandler(event);
  };

  private mouseMoveHandler = (event: MouseEvent) => {
    if (this.menuFrozen || this.mouseState === 'selecting') return;

    const target = event.target;
    // 鼠标不在编辑器内时不处理，避免拖拽出界导致状态被清空
    if (!isHTMLElement(target) || !this.editorView.dom.contains(target)) return;

    // 判断是否悬停在手柄或扩展按钮上
    const isOverHandle = target.closest('.tiptap-table-handle-menu') !== null;
    const isOverExtendButton = target.closest(
      '.tiptap-table-extend-row-column-button, .tiptap-table-add-button'
    ) !== null;

    // 悬停其上时保持显示
    if (isOverHandle || isOverExtendButton) {
      return;
    }

    // 检查鼠标是否在手柄或按钮附近，使用缓存优化性能
    const handleRects = this._getCachedHandleRects();
    let isNearHandle = false;
    for (const rect of handleRects) {
      // 周围扩展 10px 容错便于移动
      const expandedRect = new DOMRect(
        rect.left - 10,
        rect.top - 10,
        rect.width + 20,
        rect.height + 20
      );
      if (
        event.clientX >= expandedRect.left &&
        event.clientX <= expandedRect.right &&
        event.clientY >= expandedRect.top &&
        event.clientY <= expandedRect.bottom
      ) {
        isNearHandle = true;
        break;
      }
    }

    // 靠近手柄时不继续处理，避免闪烁
    if (isNearHandle) {
      return;
    }

    this._handleMouseMoveNow(event);
  };

  // 获取缓存的手柄边界矩形，每100ms更新一次以提高性能
  private _getCachedHandleRects(): DOMRect[] {
    const now = Date.now();
    if (
      this.state?._cachedHandleRects &&
      this.state._cachedHandleRectsTime &&
      now - this.state._cachedHandleRectsTime < 100
    ) {
      return this.state._cachedHandleRects;
    }

    const handleElements = Array.from(
      this.editorView.root.querySelectorAll(
        '.tiptap-table-handle-menu, .tiptap-table-extend-row-column-button, .tiptap-table-add-button'
      )
    );

    const rects = handleElements
      .filter(isHTMLElement)
      .map(el => el.getBoundingClientRect());

    // 更新缓存
    if (this.state) {
      this.state._cachedHandleRects = rects;
      this.state._cachedHandleRectsTime = now;
    }

    return rects;
  }

  private hideHandles() {
    if (!this.state?.show) return;

    // 拖拽进行中保持手柄显示，保留拖拽状态
    if (this.state.draggingState) return;

    this.state = {
      ...this.state,
      show: false,
      showAddOrRemoveRowsButton: false,
      showAddOrRemoveColumnsButton: false,
      colIndex: undefined,
      rowIndex: undefined,
      referencePosCell: undefined,
      referencePosLastRow: undefined,
      referencePosLastCol: undefined,
    };
    this.emitUpdate();
  }

  private _handleMouseMoveNow(event: MouseEvent) {
    const around = domCellAround(event.target as Element);

    // 在单元格内拖拽选区时隐藏手柄
    if (
      around?.type === 'cell' &&
      this.mouseState === 'down' &&
      !this.state?.draggingState
    ) {
      this.mouseState = 'selecting';
      this.hideHandles();
      return;
    }

    if (!around || !this.editor.isEditable) {
      this.hideHandles();
      return;
    }

    const tbody = around.tbodyNode;
    if (!tbody) return;

    const tableRect = tbody.getBoundingClientRect();
    const coords = this.editor.view.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    });
    if (!coords) return;

    // 基于坐标解析当前所在的表格节点
    const $pos = this.editor.view.state.doc.resolve(coords.pos);
    let blockInfo: { node: TiptapNode; pos: number } | undefined;
    for (let d = $pos.depth; d >= 0; d--) {
      const node = $pos.node(d);
      if (isTableNode(node)) {
        blockInfo = { node, pos: d === 0 ? 0 : $pos.before(d) };
        break;
      }
    }
    if (!blockInfo || blockInfo.node.type.name !== 'table') return;

    this.tableElement = this.editor.view.nodeDOM(blockInfo.pos) as
      | HTMLElement
      | undefined;
    this.tablePos = blockInfo.pos;
    this.tableId = blockInfo.node.attrs.id;

    const wrapper = safeClosest<HTMLElement>(around.domNode, '.tableWrapper');
    const widgetContainer = wrapper?.querySelector(':scope > .table-controls') as
      | HTMLElement
      | undefined;

    // 悬停在表格外围（非单元格区域）
    if (around.type === 'wrapper') {
      const below =
        event.clientY >= tableRect.bottom - 1 &&
        event.clientY < tableRect.bottom + 20;
      const right =
        event.clientX >= tableRect.right - 1 &&
        event.clientX < tableRect.right + 20;
      const cursorBeyondRightOrBottom =
        event.clientX > tableRect.right || event.clientY > tableRect.bottom;

      // 悬停在边缘时预先计算扩展按钮位置
      let referencePosLastRow: DOMRect | undefined;
      let referencePosLastCol: DOMRect | undefined;

      if (below || right) {
        const tbody = this.tableElement?.querySelector('tbody');
        if (tbody) {
          const lastRowIndex = blockInfo.node.content.childCount - 1;
          const lastColIndex =
            (blockInfo.node.content.firstChild?.content.childCount ?? 0) - 1;

          if (below) {
            const lastRow = tbody.children[lastRowIndex] as HTMLElement | undefined;
            if (lastRow) {
              referencePosLastRow = lastRow.getBoundingClientRect();
            }
          }

          if (right) {
            let maxRight = 0;
            let lastColRect: DOMRect | null = null;
            for (let i = 0; i < tbody.children.length; i++) {
              const row = tbody.children[i] as HTMLElement | undefined;
              if (row && row.children[lastColIndex]) {
                const cell = row.children[lastColIndex] as HTMLElement;
                const cellRect = cell.getBoundingClientRect();
                if (cellRect.right > maxRight) {
                  maxRight = cellRect.right;
                  lastColRect = cellRect;
                }
              }
            }
            if (lastColRect) {
              const firstRow = tbody.children[0] as HTMLElement | undefined;
              const lastRow = tbody.children[lastRowIndex] as HTMLElement | undefined;
              if (firstRow && lastRow) {
                const firstCell = firstRow.children[lastColIndex] as HTMLElement | undefined;
                if (firstCell) {
                  const firstRect = firstCell.getBoundingClientRect();
                  referencePosLastCol = new DOMRect(
                    lastColRect.right,
                    firstRect.top,
                    0,
                    lastRow.getBoundingClientRect().bottom - firstRect.top
                  );
                }
              }
            }
          }
        }
      }

      // 尝试根据鼠标 Y 找到最近的行，并使用该行的首个单元格尺寸作为句柄参考，避免整行/整表尺寸
      let nearestRowIndex: number | undefined;
      let nearestCellRect: DOMRect | undefined;
      if (!cursorBeyondRightOrBottom && tbody) {
        const rows = Array.from(tbody.children) as HTMLElement[];
        let minDist = Number.POSITIVE_INFINITY;
        rows.forEach((rowEl, idx) => {
          const rowRect = rowEl.getBoundingClientRect();
          const dist = Math.abs(event.clientY - (rowRect.top + rowRect.height / 2));
          if (dist < minDist) {
            minDist = dist;
            nearestRowIndex = idx;
            const firstCell = rowEl.children[0] as HTMLElement | undefined;
            nearestCellRect = firstCell?.getBoundingClientRect() ?? rowRect;
          }
        });
      }

      this.state = {
        ...this.state,
        show: true,
        showAddOrRemoveRowsButton: below,
        showAddOrRemoveColumnsButton: right,
        referencePosTable: tableRect,
        referencePosLastRow,
        referencePosLastCol,
        block: blockInfo.node,
        blockPos: blockInfo.pos,
        widgetContainer,
        colIndex: cursorBeyondRightOrBottom ? undefined : this.state?.colIndex,
        rowIndex: cursorBeyondRightOrBottom ? undefined : nearestRowIndex ?? this.state?.rowIndex,
        referencePosCell: cursorBeyondRightOrBottom
          ? undefined
          : nearestCellRect ?? this.state?.referencePosCell,
      };
    } else {
      // 悬停在单元格上
      const cellPosition = getCellIndicesFromDOM(
        around.domNode as HTMLTableCellElement,
        blockInfo.node,
        this.editor
      );
      if (!cellPosition) return;

      const tbodyEl = around.tbodyNode;
      let { rowIndex, colIndex } = cellPosition;

      // 如果单元格跨行，map 计算的 rowIndex 会指向起始行；这里用 DOM 行索引兜底，保证手柄定位在实际行
      const trEl = safeClosest<HTMLTableRowElement>(around.domNode, 'tr');
      if (tbodyEl && trEl) {
        const domRowIndex = Array.from(tbodyEl.children).indexOf(trEl);
        if (domRowIndex >= 0 && domRowIndex !== rowIndex) {
          rowIndex = domRowIndex;
        }
      }

      const cellRect = (around.domNode as HTMLElement).getBoundingClientRect();
      const map = TableMap.get(blockInfo.node);
      const cellIndex = rowIndex * map.width + colIndex;
      const cellOffset = map.map[cellIndex];
      const rect = cellOffset !== undefined ? map.findCell(cellOffset) : null;

      let effectiveCellRect = cellRect;

      // 如果单元格跨行，按鼠标所在行拆分高度，句柄高度限定为单行高度
      if (rect && rect.bottom - rect.top > 1) {
        const span = rect.bottom - rect.top;
        const unitHeight = cellRect.height / span;
        const clampedY = clamp(event.clientY, cellRect.top, cellRect.bottom);
        const rowOffset = Math.min(
          span - 1,
          Math.max(0, Math.floor((clampedY - cellRect.top) / unitHeight))
        );
        const rowTop = cellRect.top + unitHeight * rowOffset;

        rowIndex = rect.top + rowOffset;
        effectiveCellRect = new DOMRect(cellRect.x, rowTop, cellRect.width, unitHeight);
      } else if (trEl) {
        const trRect = trEl.getBoundingClientRect();
        effectiveCellRect = new DOMRect(cellRect.x, trRect.y, cellRect.width, trRect.height);
      }
      const lastRowIndex = blockInfo.node.content.childCount - 1;
      const lastColIndex =
        (blockInfo.node.content.firstChild?.content.childCount ?? 0) - 1;

      // 与上次同一单元格则跳过
      if (
        this.state?.show &&
        this.tableId === blockInfo.node.attrs.id &&
        this.state.rowIndex === rowIndex &&
        this.state.colIndex === colIndex
      ) {
        return;
      }

      // 计算扩展按钮位置
      let referencePosLastRow: DOMRect | undefined;
      let referencePosLastCol: DOMRect | undefined;

      if (rowIndex === lastRowIndex || colIndex === lastColIndex) {
        const tbody = this.tableElement?.querySelector('tbody');
        if (tbody) {
          // 记录末行位置
          if (rowIndex === lastRowIndex) {
            const lastRow = tbody.children[lastRowIndex] as HTMLElement | undefined;
            if (lastRow) {
              referencePosLastRow = lastRow.getBoundingClientRect();
            }
          }
          // 记录末列位置
          if (colIndex === lastColIndex) {
            // 在所有行里取最右侧单元格
            let maxRight = 0;
            let lastColRect: DOMRect | null = null;
            for (let i = 0; i < tbody.children.length; i++) {
              const row = tbody.children[i] as HTMLElement | undefined;
              if (row && row.children[lastColIndex]) {
                const cell = row.children[lastColIndex] as HTMLElement;
                const cellRect = cell.getBoundingClientRect();
                if (cellRect.right > maxRight) {
                  maxRight = cellRect.right;
                  lastColRect = cellRect;
                }
              }
            }
            if (lastColRect) {
              // 生成代表整列的矩形
              const firstRow = tbody.children[0] as HTMLElement | undefined;
              const lastRow = tbody.children[lastRowIndex] as HTMLElement | undefined;
              if (firstRow && lastRow) {
                const firstCell = firstRow.children[lastColIndex] as HTMLElement | undefined;
                if (firstCell) {
                  const firstRect = firstCell.getBoundingClientRect();
                  referencePosLastCol = new DOMRect(
                    lastColRect.right,
                    firstRect.top,
                    0,
                    lastRow.getBoundingClientRect().bottom - firstRect.top
                  );
                }
              }
            }
          }
        }
      }

      this.state = {
        show: true,
        showAddOrRemoveColumnsButton: colIndex === lastColIndex,
        showAddOrRemoveRowsButton: rowIndex === lastRowIndex,
        referencePosTable: tableRect,
        referencePosLastRow,
        referencePosLastCol,
        block: blockInfo.node,
        blockPos: blockInfo.pos,
        draggingState: undefined,
        referencePosCell: effectiveCellRect,
        colIndex,
        rowIndex,
        widgetContainer,
      };
    }

    this.emitUpdate();
    return false;
  }

  dragOverHandler = (event: DragEvent) => {
    if (this.state?.draggingState === undefined) {
      return;
    }

    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';

    hideElements(
      '.prosemirror-dropcursor-block, .prosemirror-dropcursor-inline',
      this.editorView.root
    );

    // 将鼠标坐标限制在表格包围框内
    const {
      left: tableLeft,
      right: tableRight,
      top: tableTop,
      bottom: tableBottom,
    } = this.state.referencePosTable;

    const boundedMouseCoords = {
      left: clamp(event.clientX, tableLeft + 1, tableRight - 1),
      top: clamp(event.clientY, tableTop + 1, tableBottom - 1),
    };

    // 获取所在位置的单元格元素
    const tableCellElements = this.editorView.root
      .elementsFromPoint(boundedMouseCoords.left, boundedMouseCoords.top)
      .filter((element) => element.tagName === 'TD' || element.tagName === 'TH');
    if (tableCellElements.length === 0) {
      return;
    }
    const tableCellElement = tableCellElements[0];
    if (!isHTMLElement(tableCellElement)) {
      return;
    }

    const cellPosition = getCellIndicesFromDOM(
      tableCellElement as HTMLTableCellElement,
      this.state.block,
      this.editor
    );
    if (!cellPosition) return;

    const { rowIndex, colIndex } = cellPosition;

    // 判断被拖动的索引是否改变
    const oldIndex =
      this.state.draggingState.draggedCellOrientation === 'row'
        ? this.state.rowIndex
        : this.state.colIndex;
    const newIndex =
      this.state.draggingState.draggedCellOrientation === 'row'
        ? rowIndex
        : colIndex;
    const dispatchDecorationsTransaction = newIndex !== oldIndex;

    const mousePos =
      this.state.draggingState.draggedCellOrientation === 'row'
        ? boundedMouseCoords.top
        : boundedMouseCoords.left;

    // 仅在单元格或鼠标位置变化时更新
    const cellChanged =
      this.state.rowIndex !== rowIndex || this.state.colIndex !== colIndex;
    const mousePosChanged = this.state.draggingState.mousePos !== mousePos;

    if (cellChanged || mousePosChanged) {
      const newCellRect = tableCellElement.getBoundingClientRect();
      // 拖拽时保持初始单元格尺寸，避免手柄高度抖动
      const preservedCellRect = this.state.draggingState?.originalCellSize
        ? new DOMRect(
          newCellRect.x,
          newCellRect.y,
          this.state.draggingState.originalCellSize.width,
          this.state.draggingState.originalCellSize.height
        )
        : newCellRect;

      this.state = {
        ...this.state,
        rowIndex: rowIndex,
        colIndex: colIndex,
        referencePosCell: preservedCellRect,
        draggingState: {
          ...this.state.draggingState,
          mousePos: mousePos,
        },
      };

      this.emitUpdate();
    }

    // 如需刷新拖拽装饰则派发事务
    if (dispatchDecorationsTransaction) {
      this.editor.view.dispatch(
        this.editor.state.tr.setMeta(tableHandlePluginKey, true)
      );
    }
  };

  dropHandler = () => {
    this.mouseState = 'up';

    const st = this.state;
    if (!st?.draggingState) return false;

    const { draggingState, rowIndex, colIndex, blockPos } = st;
    if (typeof blockPos !== 'number' || blockPos < 0) return false;

    if (
      (draggingState.draggedCellOrientation === 'row' &&
        rowIndex === undefined) ||
      (draggingState.draggedCellOrientation === 'col' && colIndex === undefined)
    ) {
      throw new Error(
        'Attempted to drop table row or column, but no table block was hovered prior.'
      );
    }

    const isRow = draggingState.draggedCellOrientation === 'row';
    const orientation = isRow ? 'row' : 'column';
    const destIndex = isRow ? rowIndex! : colIndex!;

    const cellCoords = getIndexCoordinates({
      editor: this.editor,
      index: draggingState.originalIndex,
      orientation,
      tablePos: blockPos,
    });
    if (!cellCoords) return false;

    const stateWithCellSel = selectCellsByCoords(
      this.editor,
      blockPos,
      cellCoords,
      { mode: 'state' }
    );
    if (!stateWithCellSel) return false;

    // mode 为 state 时 selectCellsByCoords 返回 EditorState，这里的断言是安全的
    const editorState = stateWithCellSel as EditorState;

    const dispatch = (tr: Transaction) => this.editor.view.dispatch(tr);

    if (isRow) {
      moveTableRow({
        from: draggingState.originalIndex,
        to: destIndex,
        select: true,
        pos: blockPos + 1,
      })(editorState, dispatch);
    } else {
      moveTableColumn({
        from: draggingState.originalIndex,
        to: destIndex,
        select: true,
        pos: blockPos + 1,
      })(editorState, dispatch);
    }

    this.state = { ...st, draggingState: undefined };
    this.emitUpdate();

    this.editor.view.dispatch(
      this.editor.state.tr.setMeta(tableHandlePluginKey, null)
    );

    return true;
  };

  update(view: EditorView): void {
    const pluginState = tableHandlePluginKey.getState(view.state);
    if (pluginState !== undefined && pluginState !== this.menuFrozen) {
      this.menuFrozen = pluginState;
    }

    if (!this.state?.show) return;

    if (!this.tableElement?.isConnected) {
      this.hideHandles();
      return;
    }

    const tableInfo = getTableFromDOM(this.tableElement, this.editor);
    if (!tableInfo) {
      this.hideHandles();
      return;
    }

    // 检查表格是否已变更
    const blockChanged =
      this.state.block !== tableInfo.node ||
      this.state.blockPos !== tableInfo.pos;

    if (
      !tableInfo.node ||
      tableInfo.node.type.name !== 'table' ||
      !this.tableElement?.isConnected
    ) {
      this.hideHandles();
      return;
    }

    const { height: rowCount, width: colCount } = TableMap.get(tableInfo.node);

    // 计算新的行列索引
    let newRowIndex = this.state.rowIndex;
    let newColIndex = this.state.colIndex;

    // 若删除了行/列则裁剪索引
    if (newRowIndex !== undefined && newRowIndex >= rowCount) {
      newRowIndex = rowCount ? rowCount - 1 : undefined;
    }
    if (newColIndex !== undefined && newColIndex >= colCount) {
      newColIndex = colCount ? colCount - 1 : undefined;
    }

    const tableBody = this.tableElement.querySelector('tbody');
    if (!tableBody) {
      throw new Error(
        "Table block does not contain a 'tbody' HTML element. This should never happen."
      );
    }

    // 计算新的参考位置信息
    let newReferencePosCell = this.state.referencePosCell;
    if (newRowIndex !== undefined && newColIndex !== undefined) {
      const rowEl = tableBody.children[newRowIndex];
      const cellEl = rowEl?.children[newColIndex];

      if (cellEl) {
        const newCellRect = cellEl.getBoundingClientRect();
        // 拖拽时保持最初的单元格尺寸，避免高度抖动
        if (this.state.draggingState?.originalCellSize) {
          newReferencePosCell = new DOMRect(
            newCellRect.x,
            newCellRect.y,
            this.state.draggingState.originalCellSize.width,
            this.state.draggingState.originalCellSize.height
          );
        } else {
          newReferencePosCell = newCellRect;
        }
      } else {
        newRowIndex = undefined;
        newColIndex = undefined;
        newReferencePosCell = undefined;
      }
    }

    const newReferencePosTable = tableBody.getBoundingClientRect();

    // 如需显示扩展按钮则刷新末行末列位置
    let newReferencePosLastRow = this.state.referencePosLastRow;
    let newReferencePosLastCol = this.state.referencePosLastCol;

    if (this.state.showAddOrRemoveRowsButton || this.state.showAddOrRemoveColumnsButton) {
      const lastRowIndex = tableInfo.node.content.childCount - 1;
      const lastColIndex =
        (tableInfo.node.content.firstChild?.content.childCount ?? 0) - 1;

      if (this.state.showAddOrRemoveRowsButton) {
        const lastRow = tableBody.children[lastRowIndex] as HTMLElement | undefined;
        if (lastRow) {
          newReferencePosLastRow = lastRow.getBoundingClientRect();
        }
      }

      if (this.state.showAddOrRemoveColumnsButton) {
        let maxRight = 0;
        let lastColRect: DOMRect | null = null;
        for (let i = 0; i < tableBody.children.length; i++) {
          const row = tableBody.children[i] as HTMLElement | undefined;
          if (row && row.children[lastColIndex]) {
            const cell = row.children[lastColIndex] as HTMLElement;
            const cellRect = cell.getBoundingClientRect();
            if (cellRect.right > maxRight) {
              maxRight = cellRect.right;
              lastColRect = cellRect;
            }
          }
        }
        if (lastColRect) {
          const firstRow = tableBody.children[0] as HTMLElement | undefined;
          const lastRow = tableBody.children[lastRowIndex] as HTMLElement | undefined;
          if (firstRow && lastRow) {
            const firstCell = firstRow.children[lastColIndex] as HTMLElement | undefined;
            if (firstCell) {
              const firstRect = firstCell.getBoundingClientRect();
              newReferencePosLastCol = new DOMRect(
                lastColRect.right,
                firstRect.top,
                0,
                lastRow.getBoundingClientRect().bottom - firstRect.top
              );
            }
          }
        }
      }
    }

    // 若任一关键数据变化则推送更新
    const indicesChanged =
      newRowIndex !== this.state.rowIndex || newColIndex !== this.state.colIndex;
    const refPosChanged =
      newReferencePosCell !== this.state.referencePosCell ||
      newReferencePosTable !== this.state.referencePosTable ||
      newReferencePosLastRow !== this.state.referencePosLastRow ||
      newReferencePosLastCol !== this.state.referencePosLastCol;

    if (blockChanged || indicesChanged || refPosChanged) {
      this.state = {
        ...this.state,
        block: tableInfo.node,
        blockPos: tableInfo.pos,
        rowIndex: newRowIndex,
        colIndex: newColIndex,
        referencePosCell: newReferencePosCell,
        referencePosTable: newReferencePosTable,
        referencePosLastRow: newReferencePosLastRow,
        referencePosLastCol: newReferencePosLastCol,
      };
      this.emitUpdate();
    }
  }

  private scrollHandler = () => {
    // 滚动时若手柄可见则重新计算位置
    if (this.state?.show && this.tableElement?.isConnected) {
      // 强制刷新定位
      this.updatePositions();
    }
  };

  private updatePositions() {
    if (!this.state?.show || !this.tableElement?.isConnected) return;

    const tableInfo = getTableFromDOM(this.tableElement, this.editor);
    if (!tableInfo || tableInfo.node.type.name !== 'table') return;

    const tableBody = this.tableElement.querySelector('tbody');
    if (!tableBody) return;

    const newReferencePosTable = tableBody.getBoundingClientRect();

    // 若已有行列索引则同步单元格位置
    let newReferencePosCell = this.state.referencePosCell;
    if (
      this.state.rowIndex !== undefined &&
      this.state.colIndex !== undefined
    ) {
      const rowEl = tableBody.children[this.state.rowIndex];
      const cellEl = rowEl?.children[this.state.colIndex];
      if (cellEl) {
        const newCellRect = cellEl.getBoundingClientRect();
        // 拖拽时保留初始尺寸
        if (this.state.draggingState?.originalCellSize) {
          newReferencePosCell = new DOMRect(
            newCellRect.x,
            newCellRect.y,
            this.state.draggingState.originalCellSize.width,
            this.state.draggingState.originalCellSize.height
          );
        } else {
          newReferencePosCell = newCellRect;
        }
      }
    }

    // 如需显示扩展按钮则刷新末行末列位置
    let newReferencePosLastRow = this.state.referencePosLastRow;
    let newReferencePosLastCol = this.state.referencePosLastCol;

    if (this.state.showAddOrRemoveRowsButton || this.state.showAddOrRemoveColumnsButton) {
      const lastRowIndex = tableInfo.node.content.childCount - 1;
      const lastColIndex =
        (tableInfo.node.content.firstChild?.content.childCount ?? 0) - 1;

      if (this.state.showAddOrRemoveRowsButton) {
        const lastRow = tableBody.children[lastRowIndex] as HTMLElement | undefined;
        if (lastRow) {
          newReferencePosLastRow = lastRow.getBoundingClientRect();
        }
      }

      if (this.state.showAddOrRemoveColumnsButton) {
        let maxRight = 0;
        let lastColRect: DOMRect | null = null;
        for (let i = 0; i < tableBody.children.length; i++) {
          const row = tableBody.children[i] as HTMLElement | undefined;
          if (row && row.children[lastColIndex]) {
            const cell = row.children[lastColIndex] as HTMLElement;
            const cellRect = cell.getBoundingClientRect();
            if (cellRect.right > maxRight) {
              maxRight = cellRect.right;
              lastColRect = cellRect;
            }
          }
        }
        if (lastColRect) {
          const firstRow = tableBody.children[0] as HTMLElement | undefined;
          const lastRow = tableBody.children[lastRowIndex] as HTMLElement | undefined;
          if (firstRow && lastRow) {
            const firstCell = firstRow.children[lastColIndex] as HTMLElement | undefined;
            if (firstCell) {
              const firstRect = firstCell.getBoundingClientRect();
              newReferencePosLastCol = new DOMRect(
                lastColRect.right,
                firstRect.top,
                0,
                lastRow.getBoundingClientRect().bottom - firstRect.top
              );
            }
          }
        }
      }
    }

    // 对比具体属性，确认位置是否发生变化
    const refPosChanged =
      !newReferencePosCell ||
      !this.state.referencePosCell ||
      newReferencePosCell.x !== this.state.referencePosCell.x ||
      newReferencePosCell.y !== this.state.referencePosCell.y ||
      newReferencePosTable.x !== this.state.referencePosTable.x ||
      newReferencePosTable.y !== this.state.referencePosTable.y ||
      (newReferencePosLastRow &&
        this.state.referencePosLastRow &&
        (newReferencePosLastRow.x !== this.state.referencePosLastRow.x ||
          newReferencePosLastRow.y !== this.state.referencePosLastRow.y)) ||
      (newReferencePosLastCol &&
        this.state.referencePosLastCol &&
        (newReferencePosLastCol.x !== this.state.referencePosLastCol.x ||
          newReferencePosLastCol.y !== this.state.referencePosLastCol.y));

    if (refPosChanged) {
      this.state = {
        ...this.state,
        referencePosCell: newReferencePosCell,
        referencePosTable: newReferencePosTable,
        referencePosLastRow: newReferencePosLastRow,
        referencePosLastCol: newReferencePosLastCol,
      };
      this.emitUpdate();
    }
  }

  destroy(): void {
    this.editorView.dom.removeEventListener(
      'mousemove',
      this.mouseMoveHandler as EventListener
    );
    window.removeEventListener('mouseup', this.mouseUpHandler as EventListener);
    this.editorView.dom.removeEventListener(
      'mousedown',
      this.viewMousedownHandler as EventListener
    );
    this.editorView.root.removeEventListener(
      'dragover',
      this.dragOverHandler as EventListener
    );
    this.editorView.root.removeEventListener(
      'drop',
      this.dropHandler as unknown as EventListener
    );
    window.removeEventListener('scroll', this.scrollHandler, true);
    window.removeEventListener('resize', this.scrollHandler);
  }
}

let tableHandleView: TableHandleView | null = null;

export function TableHandlePlugin(
  editor: Editor,
  emitUpdate: (state: TableHandlesState) => void
): Plugin {
  return new Plugin({
    key: tableHandlePluginKey,

    state: {
      init: () => false,
      apply: (tr, frozen) => {
        const meta = tr.getMeta(tableHandlePluginKey);
        return meta !== undefined ? meta : frozen;
      },
    },

    view: (editorView) => {
      tableHandleView = new TableHandleView(editor, editorView, emitUpdate);

      return tableHandleView;
    },

    props: {
      decorations: (state) => {
        if (!tableHandleView) return null;

        if (
          tableHandleView === undefined ||
          tableHandleView.state === undefined ||
          tableHandleView.state.draggingState === undefined ||
          tableHandleView.tablePos === undefined
        ) {
          return;
        }

        const newIndex =
          tableHandleView.state.draggingState.draggedCellOrientation === 'row'
            ? tableHandleView.state.rowIndex
            : tableHandleView.state.colIndex;

        if (newIndex === undefined) {
          return;
        }

        const decorations: Decoration[] = [];
        const { draggingState } = tableHandleView.state;
        const { originalIndex } = draggingState;

        if (
          tableHandleView.state.draggingState.draggedCellOrientation === 'row'
        ) {
          const originalCells = getRowCells(
            editor,
            originalIndex,
            tableHandleView.state.blockPos
          );
          originalCells.cells.forEach((cell) => {
            if (cell.node) {
              decorations.push(
                Decoration.node(cell.pos, cell.pos + cell.node.nodeSize, {
                  class: 'table-cell-dragging-source',
                })
              );
            }
          });
        } else {
          const originalCells = getColumnCells(
            editor,
            originalIndex,
            tableHandleView.state.blockPos
          );
          originalCells.cells.forEach((cell) => {
            if (cell.node) {
              decorations.push(
                Decoration.node(cell.pos, cell.pos + cell.node.nodeSize, {
                  class: 'table-cell-dragging-source',
                })
              );
            }
          });
        }

        // 若无变更或 editor 不存在，直接返回已有装饰
        if (newIndex === originalIndex || !editor) {
          return DecorationSet.create(state.doc, decorations);
        }

        if (
          tableHandleView.state.draggingState.draggedCellOrientation === 'row'
        ) {
          const cellsInRow = getRowCells(
            editor,
            newIndex,
            tableHandleView.state.blockPos
          );

          cellsInRow.cells.forEach((cell) => {
            const cellNode = cell.node;
            if (!cellNode) {
              return;
            }

            // 根据拖动方向在单元格首尾插入装饰
            const decorationPos =
              cell.pos + (newIndex > originalIndex ? cellNode.nodeSize - 2 : 2);
            decorations.push(
              Decoration.widget(decorationPos, () => {
                const widget = document.createElement('div');
                widget.className = 'tiptap-table-dropcursor';
                widget.style.position = 'absolute';
                widget.style.left = '0';
                widget.style.right = '0';
                widget.style.zIndex = '20';
                widget.style.pointerEvents = 'none';
                // 处理奇偶像素差，避免行插入指示线的视觉偏差
                if (newIndex > originalIndex) {
                  widget.style.bottom = '-1px';
                } else {
                  widget.style.top = '-1px';
                }
                widget.style.height = '3px';
                widget.style.backgroundColor = 'var(--mui-palette-primary-main, #1976d2)';

                return widget;
              })
            );
          });
        } else {
          const cellsInColumn = getColumnCells(
            editor,
            newIndex,
            tableHandleView.state.blockPos
          );
          cellsInColumn.cells.forEach((cell) => {
            const cellNode = cell.node;
            if (!cellNode) {
              return;
            }
            // 根据拖动方向在单元格首尾插入装饰
            const decorationPos =
              cell.pos + (newIndex > originalIndex ? cellNode.nodeSize - 2 : 2);
            decorations.push(
              Decoration.widget(decorationPos, () => {
                const widget = document.createElement('div');
                widget.className = 'tiptap-table-dropcursor';
                widget.style.position = 'absolute';
                widget.style.top = '0';
                widget.style.bottom = '0';
                widget.style.zIndex = '20';
                widget.style.pointerEvents = 'none';
                // 处理奇偶像素差，避免列插入指示线的视觉偏差
                if (newIndex > originalIndex) {
                  widget.style.right = '-1px';
                } else {
                  widget.style.left = '-1px';
                }
                widget.style.width = '3px';
                widget.style.backgroundColor = 'var(--mui-palette-primary-main, #1976d2)';
                return widget;
              })
            );
          });
        }

        return DecorationSet.create(state.doc, decorations);
      },
    },
  });
}

/** 行/列通用的拖拽起始处理 */
const tableDragStart = (
  orientation: 'col' | 'row',
  event: {
    dataTransfer: DataTransfer | null;
    currentTarget: EventTarget & Element;
    clientX: number;
    clientY: number;
  }
) => {
  // 若状态不存在，尝试从 DOM 或 data 属性恢复
  if (!tableHandleView?.state) {
    const handleElement = event.currentTarget as HTMLElement;

    // 优先使用组件写入的 data 属性恢复
    const dataIndex = handleElement.dataset.tableIndex;
    const dataTablePos = handleElement.dataset.tablePos;
    const dataTableId = handleElement.dataset.tableId;

    if (dataIndex && dataTablePos && tableHandleView) {
      const index = parseInt(dataIndex, 10);
      const blockPos = parseInt(dataTablePos, 10);

      if (!isNaN(index) && !isNaN(blockPos)) {
        // 尝试找到对应表格节点
        const tableNode = tableHandleView.editor.state.doc.nodeAt(blockPos);
        if (tableNode && isTableNode(tableNode)) {
          const tableWrapper = safeClosest<HTMLElement>(handleElement, '.tableWrapper');
          const tbody = tableWrapper?.querySelector('tbody');

          if (tbody) {
            const tableRect = tbody.getBoundingClientRect();

            // 构造最小拖拽状态
            const recoveredState: TableHandlesState = {
              show: true,
              showAddOrRemoveRowsButton: false,
              showAddOrRemoveColumnsButton: false,
              referencePosTable: tableRect,
              block: tableNode,
              blockPos: blockPos,
              colIndex: orientation === 'col' ? index : undefined,
              rowIndex: orientation === 'row' ? index : undefined,
              referencePosCell: undefined,
              widgetContainer: undefined,
            };

            tableHandleView.state = recoveredState;
          }
        }
      }
    }

    // 若仍无状态，再尝试基于 DOM 恢复
    if (!tableHandleView?.state) {
      const tableWrapper = safeClosest<HTMLElement>(handleElement, '.tableWrapper');

      if (!tableWrapper || !tableHandleView) {
        // 无法恢复则静默取消拖拽
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'none';
        }
        return;
      }

      // 基于 DOM 获取表格信息
      const tableInfo = getTableFromDOM(tableWrapper, tableHandleView.editor);
      if (!tableInfo) {
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'none';
        }
        return;
      }

      // 构建基础状态
      const tbody = tableWrapper.querySelector('tbody');
      if (!tbody) {
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'none';
        }
        return;
      }

      // 通过手柄位置估算索引（兜底方案）
      const tableRect = tbody.getBoundingClientRect();
      const handleRect = handleElement.getBoundingClientRect();

      // 通过坐标粗略推算索引，避免报错
      let approximateIndex = 0;
      if (orientation === 'row') {
        const rowHeight = tableRect.height / tableInfo.node.content.childCount;
        approximateIndex = Math.floor((handleRect.top - tableRect.top) / rowHeight);
      } else {
        const colWidth = tableRect.width / (tableInfo.node.content.firstChild?.content.childCount ?? 1);
        approximateIndex = Math.floor((handleRect.left - tableRect.left) / colWidth);
      }

      // 构造最小拖拽状态
      const recoveredState: TableHandlesState = {
        show: true,
        showAddOrRemoveRowsButton: false,
        showAddOrRemoveColumnsButton: false,
        referencePosTable: tableRect,
        block: tableInfo.node,
        blockPos: tableInfo.pos,
        colIndex: orientation === 'col' ? approximateIndex : undefined,
        rowIndex: orientation === 'row' ? approximateIndex : undefined,
        referencePosCell: undefined,
        widgetContainer: undefined,
      };

      tableHandleView.state = recoveredState;
    }

    // 最终仍无状态则取消拖拽
    if (!tableHandleView?.state) {
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'none';
      }
      return;
    }
  }

  const { state, editor } = tableHandleView;
  const index = orientation === 'col' ? state.colIndex : state.rowIndex;

  if (index === undefined) {
    // 无法确定索引，静默取消
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'none';
    }
    return;
  }

  const { blockPos, referencePosCell } = state;
  const mousePos = orientation === 'col' ? event.clientX : event.clientY;

  // 清除单元格选区，避免表格引用塌缩
  if (editor.state.selection instanceof CellSelection) {
    const safeSel = TextSelection.near(editor.state.doc.resolve(blockPos), 1);
    editor.view.dispatch(editor.state.tr.setSelection(safeSel));
  }

  const dragImage = createTableDragImage(editor, orientation, index, blockPos);

  // 配置拖拽预览图
  if (event.dataTransfer) {
    const handleRect = (
      event.currentTarget as HTMLElement
    ).getBoundingClientRect();
    const offset =
      orientation === 'col'
        ? { x: handleRect.width / 2, y: 0 }
        : { x: 0, y: handleRect.height / 2 };

    event.dataTransfer.effectAllowed =
      orientation === 'col' ? 'move' : 'copyMove';
    event.dataTransfer.setDragImage(dragImage, offset.x, offset.y);
  }

  // 清理拖拽预览图
  const cleanup = () => dragImage.parentNode?.removeChild(dragImage);
  document.addEventListener('drop', cleanup, { once: true });
  document.addEventListener('dragend', cleanup, { once: true });

  const initialOffset = referencePosCell
    ? (orientation === 'col' ? referencePosCell.left : referencePosCell.top) -
    mousePos
    : 0;

  // 记录原始单元格尺寸，拖拽中保持不变
  const originalCellSize = referencePosCell
    ? { width: referencePosCell.width, height: referencePosCell.height }
    : undefined;

  // 写回拖拽状态
  tableHandleView.state = {
    ...state,
    draggingState: {
      draggedCellOrientation: orientation,
      originalIndex: index,
      mousePos,
      initialOffset,
      originalCellSize,
    },
  };
  tableHandleView.emitUpdate();
  editor.view.dispatch(editor.state.tr.setMeta(tableHandlePluginKey, true));
};

/** 列拖拽句柄回调 */
export const colDragStart = (event: {
  dataTransfer: DataTransfer | null;
  currentTarget: EventTarget & Element;
  clientX: number;
}) => tableDragStart('col', { ...event, clientY: 0 });

/** 行拖拽句柄回调 */
export const rowDragStart = (event: {
  dataTransfer: DataTransfer | null;
  currentTarget: EventTarget & Element;
  clientY: number;
}) => tableDragStart('row', { ...event, clientX: 0 });

/** 拖拽结束后的清理 */
export const dragEnd = () => {
  if (!tableHandleView || tableHandleView.state === undefined) {
    return;
  }

  tableHandleView.state = {
    ...tableHandleView.state,
    draggingState: undefined,
  };
  tableHandleView.emitUpdate();

  const editor = tableHandleView.editor;
  editor.view.dispatch(editor.state.tr.setMeta(tableHandlePluginKey, null));
};

