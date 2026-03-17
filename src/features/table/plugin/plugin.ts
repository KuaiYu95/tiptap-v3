import type { Editor } from '@tiptap/core';
import type { Node as TiptapNode } from '@tiptap/pm/model';
import type { EditorState, PluginView, Transaction } from '@tiptap/pm/state';
import { Plugin, TextSelection } from '@tiptap/pm/state';
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
} from '../../../utils/table';
import {
  setTableHandleRuntime,
  tableHandlePluginKey,
  TableHandlesState,
} from './shared';
import { buildTableDragDecorations } from './decorations';
import { buildCellHoverState, buildWrapperHoverState } from './hover-state';
import {
  didReferencePositionsChange,
  getCachedHandleRects,
  getLastEdgeReferences,
  getNearestRowReference,
  getReferenceCellRect,
  isPointerNearHandle,
  preserveCellRectSize,
} from './positioning';
import { syncTableHandleState } from './state-sync';

function hideElements(selector: string, rootEl: Document | ShadowRoot) {
  rootEl.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    el.style.visibility = 'hidden';
  });
}
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

    const target = event.target as Node | null;
    // 鼠标不在编辑器内时不处理，避免拖拽出界导致状态被清空
    if (!isHTMLElement(target) || !this.editorView.dom.contains(target)) return;

    // 判断是否悬停在手柄或扩展按钮上
    const elementTarget = target as HTMLElement;
    const isOverHandle = elementTarget.closest('.tiptap-table-handle-menu') !== null;
    const isOverExtendButton = elementTarget.closest(
      '.tiptap-table-extend-row-column-button, .tiptap-table-add-button'
    ) !== null;

    // 悬停其上时保持显示
    if (isOverHandle || isOverExtendButton) {
      return;
    }

    const handleRects = getCachedHandleRects({
      root: this.editorView.root,
      state: this.state,
    });

    if (isPointerNearHandle(event, handleRects)) {
      return;
    }

    this._handleMouseMoveNow(event);
  };

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

      const { referencePosLastRow, referencePosLastCol } =
        below || right
          ? getLastEdgeReferences({
            tableBody: tbody,
            tableNode: blockInfo.node,
            includeLastRow: below,
            includeLastColumn: right,
          })
          : { referencePosLastRow: undefined, referencePosLastCol: undefined };

      const nearestReference = !cursorBeyondRightOrBottom
        ? getNearestRowReference(tbody, event.clientY)
        : {};

      this.state = buildWrapperHoverState({
        previousState: this.state,
        tableRect,
        referencePosLastRow,
        referencePosLastCol,
        block: blockInfo.node,
        blockPos: blockInfo.pos,
        widgetContainer,
        keepColIndex: this.state?.colIndex,
        nextRowIndex: nearestReference.rowIndex,
        nextReferencePosCell: nearestReference.cellRect,
        resetIndices: cursorBeyondRightOrBottom,
      });
    } else {
      // 悬停在单元格上
      const cellPosition = getCellIndicesFromDOM(
        around.domNode as HTMLTableCellElement,
        blockInfo.node,
        this.editor
      );
      if (!cellPosition) return;

      const tbodyEl = around.tbodyNode;
      if (!tbodyEl) return;
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

      const { referencePosLastRow, referencePosLastCol } =
        rowIndex === lastRowIndex || colIndex === lastColIndex
          ? getLastEdgeReferences({
            tableBody: tbodyEl,
            tableNode: blockInfo.node,
            includeLastRow: rowIndex === lastRowIndex,
            includeLastColumn: colIndex === lastColIndex,
          })
          : { referencePosLastRow: undefined, referencePosLastCol: undefined };

      this.state = buildCellHoverState({
        tableRect,
        referencePosLastRow,
        referencePosLastCol,
        block: blockInfo.node,
        blockPos: blockInfo.pos,
        widgetContainer,
        draggingState: undefined,
        referencePosCell: effectiveCellRect,
        colIndex,
        rowIndex,
      });
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
      const preservedCellRect = preserveCellRectSize({
        rect: tableCellElement.getBoundingClientRect(),
        originalSize: this.state.draggingState?.originalCellSize,
      });

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

    const syncResult = syncTableHandleState({
      editor: this.editor,
      tableElement: this.tableElement,
      state: this.state,
    });
    if (!syncResult) {
      this.hideHandles();
      return;
    }

    if (blockChanged || syncResult.indicesChanged || syncResult.refPosChanged) {
      this.state = syncResult.nextState;
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

    const syncResult = syncTableHandleState({
      editor: this.editor,
      tableElement: this.tableElement,
      state: this.state,
    });
    if (!syncResult) return;

    if (syncResult.refPosChanged) {
      this.state = syncResult.nextState;
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
    setTableHandleRuntime(null);
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
      setTableHandleRuntime(tableHandleView);

      return tableHandleView;
    },

    props: {
      decorations: (state) => {
        if (!tableHandleView || !tableHandleView.state?.draggingState) {
          return null;
        }

        return buildTableDragDecorations({
          editor,
          doc: state.doc,
          tableState: tableHandleView.state,
        });
      },
    },
  });
}
