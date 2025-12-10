import type { Node } from '@tiptap/pm/model';
import { Selection, type EditorState, type Transaction } from '@tiptap/pm/state';
import type { FindNodeResult } from '@tiptap/pm/tables';
import {
  cellAround,
  CellSelection,
  findTable,
  selectedRect,
  selectionCell,
  TableMap
} from '@tiptap/pm/tables';
import { Mapping } from '@tiptap/pm/transform';
import type { Editor } from '@tiptap/react';

export const RESIZE_MIN_WIDTH = 35;
export const EMPTY_CELL_WIDTH = 120;
export const EMPTY_CELL_HEIGHT = 40;

export type Orientation = 'row' | 'column';
export interface CellInfo extends FindNodeResult {
  row: number;
  column: number;
}

export type CellCoordinates = {
  row: number;
  col: number;
};

export type SelectionReturnMode = 'state' | 'transaction' | 'dispatch';

export type BaseSelectionOptions = { mode?: SelectionReturnMode };
export type DispatchSelectionOptions = {
  mode: 'dispatch';
  dispatch: (tr: Transaction) => void;
};
export type TransactionSelectionOptions = { mode: 'transaction' };
export type StateSelectionOptions = { mode?: 'state' };

export type TableInfo = {
  map: TableMap;
} & FindNodeResult;

export type CellWithRect = {
  pos: number;
  node: Node;
  rect: { left: number; right: number; top: number; bottom: number };
};


const EMPTY_CELLS_RESULT = { cells: [], mergedCells: [] };

export function isHTMLElement(n: unknown): n is HTMLElement {
  return n instanceof HTMLElement;
}

export type DomCellAroundResult =
  | {
    type: 'cell';
    domNode: HTMLElement;
    tbodyNode: HTMLTableSectionElement | null;
  }
  | {
    type: 'wrapper';
    domNode: HTMLElement;
    tbodyNode: HTMLTableSectionElement | null;
  };

export function safeClosest<T extends Element>(
  start: Element | null,
  selector: string
): T | null {
  return (start?.closest?.(selector) as T | null) ?? null;
}

export function domCellAround(
  target: Element
): DomCellAroundResult | undefined {
  let current: Element | null = target;

  while (
    current &&
    current.tagName !== 'TD' &&
    current.tagName !== 'TH' &&
    !current.classList.contains('tableWrapper')
  ) {
    if (current.classList.contains('ProseMirror')) return undefined;
    current = isHTMLElement(current.parentNode)
      ? (current.parentNode as Element)
      : null;
  }

  if (!current) return undefined;

  if (current.tagName === 'TD' || current.tagName === 'TH') {
    return {
      type: 'cell',
      domNode: current as HTMLElement,
      tbodyNode: safeClosest<HTMLTableSectionElement>(current, 'tbody'),
    };
  }

  return {
    type: 'wrapper',
    domNode: current as HTMLElement,
    tbodyNode: (current as HTMLElement).querySelector('tbody'),
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function isWithinBounds(row: number, col: number, map: TableMap): boolean {
  return row >= 0 && row < map.height && col >= 0 && col < map.width;
}

function resolveOrientationIndex(
  state: EditorState,
  table: TableInfo,
  orientation: Orientation,
  providedIndex?: number
): number | null {
  if (typeof providedIndex === 'number') {
    return providedIndex;
  }

  if (state.selection instanceof CellSelection) {
    const rect = selectedRect(state);
    return orientation === 'row' ? rect.top : rect.left;
  }

  const $cell = cellAround(state.selection.$anchor) ?? selectionCell(state);
  if (!$cell) return null;

  const rel = $cell.pos - table.start;
  const rect = table.map.findCell(rel);
  return orientation === 'row' ? rect.top : rect.left;
}

function createCellInfo(
  row: number,
  column: number,
  cellPos: number,
  cellNode: Node
): CellInfo {
  return {
    row,
    column,
    pos: cellPos,
    node: cellNode,
    start: cellPos + 1,
    depth: cellNode ? cellNode.content.size : 0,
  };
}

export function isCellMerged(node: Node | null): boolean {
  if (!node) return false;
  const colspan = node.attrs.colspan ?? 1;
  const rowspan = node.attrs.rowspan ?? 1;
  return colspan > 1 || rowspan > 1;
}

export function getUniqueCellsWithRect(table: TableInfo): CellWithRect[] {
  const seen = new Set<number>();
  const cells: CellWithRect[] = [];
  const { map, node, start } = table;

  for (const offset of map.map) {
    if (seen.has(offset)) continue;
    seen.add(offset);

    const cellNode = node.nodeAt(offset);
    if (!cellNode) continue;

    const rect = map.findCell(offset);
    cells.push({
      pos: start + offset,
      node: cellNode,
      rect,
    });
  }

  return cells;
}

function collectCells(
  editor: Editor | null,
  orientation: Orientation,
  index?: number,
  tablePos?: number
): { cells: CellInfo[]; mergedCells: CellInfo[] } {
  if (!editor) return EMPTY_CELLS_RESULT;

  const { state } = editor;
  const table = getTable(editor, tablePos);
  if (!table) return EMPTY_CELLS_RESULT;

  const tableStart = table.start;
  const tableNode = table.node;
  const map = table.map;

  const resolvedIndex = resolveOrientationIndex(
    state,
    table,
    orientation,
    index
  );
  if (resolvedIndex === null) return EMPTY_CELLS_RESULT;

  // 边界检查
  const maxIndex = orientation === 'row' ? map.height : map.width;
  if (resolvedIndex < 0 || resolvedIndex >= maxIndex) {
    return EMPTY_CELLS_RESULT;
  }

  const cells: CellInfo[] = [];
  const mergedCells: CellInfo[] = [];
  const seenMerged = new Set<number>();

  const iterationCount = orientation === 'row' ? map.width : map.height;

  for (let i = 0; i < iterationCount; i++) {
    const row = orientation === 'row' ? resolvedIndex : i;
    const col = orientation === 'row' ? i : resolvedIndex;
    const cellIndex = row * map.width + col;
    const mapCell = map.map[cellIndex];

    if (mapCell === undefined) continue;

    const cellPos = tableStart + mapCell;
    const cellNode = tableNode.nodeAt(mapCell);
    if (!cellNode) continue;

    const cell = createCellInfo(row, col, cellPos, cellNode);

    if (isCellMerged(cellNode)) {
      if (!seenMerged.has(cellPos)) {
        mergedCells.push(cell);
        seenMerged.add(cellPos);
      }
    }

    cells.push(cell);
  }

  return { cells, mergedCells };
}

function countEmptyCellsFromEnd(
  editor: Editor,
  tablePos: number,
  orientation: Orientation
): number {
  const table = getTable(editor, tablePos);
  if (!table) return 0;

  const { doc } = editor.state;
  const maxIndex = orientation === 'row' ? table.map.height : table.map.width;

  let emptyCount = 0;
  for (let idx = maxIndex - 1; idx >= 0; idx--) {
    const seen = new Set<number>();
    let isLineEmpty = true;

    const iterationCount =
      orientation === 'row' ? table.map.width : table.map.height;

    for (let i = 0; i < iterationCount; i++) {
      const row = orientation === 'row' ? idx : i;
      const col = orientation === 'row' ? i : idx;
      const rel = table.map.positionAt(row, col, table.node);

      if (seen.has(rel)) continue;
      seen.add(rel);

      const abs = tablePos + 1 + rel;
      const cell = doc.nodeAt(abs);
      if (!cell) continue;

      if (!isCellEmpty(cell)) {
        isLineEmpty = false;
        break;
      }
    }

    if (isLineEmpty) emptyCount++;
    else break;
  }

  return emptyCount;
}

export function getTable(editor: Editor | null, tablePos?: number) {
  if (!editor) return null;

  let table = null;

  if (typeof tablePos === 'number') {
    const tableNode = editor.state.doc.nodeAt(tablePos);
    if (tableNode?.type.name === 'table') {
      table = {
        node: tableNode,
        pos: tablePos,
        start: tablePos + 1,
        depth: editor.state.doc.resolve(tablePos).depth,
      };
    }
  }

  if (!table) {
    const { state } = editor;
    const $from = state.doc.resolve(state.selection.from);
    table = findTable($from);
  }

  if (!table) return null;

  const tableMap = TableMap.get(table.node);
  if (!tableMap) return null;

  return { ...table, map: tableMap };
}

export function isSelectionInCell(state: EditorState): boolean {
  const { selection } = state;
  const $from = selection.$from;

  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
      return true;
    }
  }

  return false;
}

export function runPreservingCursor(editor: Editor, fn: () => void): boolean {
  const view = editor.view;
  const startSel = view.state.selection;
  const bookmark = startSel.getBookmark();

  const mapping = new Mapping();
  const originalDispatch = view.dispatch;

  view.dispatch = (tr) => {
    mapping.appendMapping(tr.mapping);
    originalDispatch(tr);
  };

  try {
    fn();
  } finally {
    view.dispatch = originalDispatch;
  }

  try {
    const sel = bookmark.map(mapping).resolve(view.state.doc);
    view.dispatch(view.state.tr.setSelection(sel));
    return true;
  } catch {
    // 若原位置失效（如单元格被删），则跳转到最近可用位置
    const mappedPos = mapping.map(startSel.from, -1);
    const clamped = clamp(mappedPos, 0, view.state.doc.content.size);
    const near = Selection.near(view.state.doc.resolve(clamped), -1);
    view.dispatch(view.state.tr.setSelection(near));
    return false;
  }
}

export function isCellEmpty(cellNode: Node): boolean {
  if (cellNode.childCount === 0) return true;

  let isEmpty = true;
  cellNode.descendants((n) => {
    if (n.isText && n.text?.trim()) {
      isEmpty = false;
      return false;
    }
    if (n.isLeaf && !n.isText) {
      isEmpty = false;
      return false;
    }
    return true;
  });

  return isEmpty;
}

export function countEmptyRowsFromEnd(
  editor: Editor,
  tablePos: number
): number {
  return countEmptyCellsFromEnd(editor, tablePos, 'row');
}

export function countEmptyColumnsFromEnd(
  editor: Editor,
  tablePos: number
): number {
  return countEmptyCellsFromEnd(editor, tablePos, 'column');
}

export function marginRound(num: number, margin = 0.3): number {
  const floor = Math.floor(num);
  const ceil = Math.ceil(num);
  const lowerBound = floor + margin;
  const upperBound = ceil - margin;

  if (num < lowerBound) return floor;
  if (num > upperBound) return ceil;
  return Math.round(num);
}

function applySelectionWithMode(
  state: EditorState,
  transaction: Transaction,
  options: BaseSelectionOptions | DispatchSelectionOptions
): EditorState | Transaction | void {
  const mode: SelectionReturnMode = options.mode ?? 'state';

  switch (mode) {
    case 'dispatch': {
      const dispatchOptions = options as DispatchSelectionOptions;
      if (typeof dispatchOptions.dispatch === 'function') {
        dispatchOptions.dispatch(transaction);
      }
      return;
    }

    case 'transaction':
      return transaction;

    default: // "state"
      return state.apply(transaction);
  }
}

export function selectCellsByCoords(
  editor: Editor | null,
  tablePos: number,
  coords: { row: number; col: number }[],
  options: BaseSelectionOptions | DispatchSelectionOptions = { mode: 'state' }
): EditorState | Transaction | void {
  if (!editor) return;

  const table = getTable(editor, tablePos);
  if (!table) return;

  const { state } = editor;
  const tableMap = table.map;

  const cleanedCoords = coords
    .map((coord) => ({
      row: clamp(coord.row, 0, tableMap.height - 1),
      col: clamp(coord.col, 0, tableMap.width - 1),
    }))
    .filter((coord) => isWithinBounds(coord.row, coord.col, tableMap));

  if (cleanedCoords.length === 0) {
    return;
  }

  // 找出包含所有坐标的最小矩形
  const allRows = cleanedCoords.map((coord) => coord.row);
  const topRow = Math.min(...allRows);
  const bottomRow = Math.max(...allRows);

  const allCols = cleanedCoords.map((coord) => coord.col);
  const leftCol = Math.min(...allCols);
  const rightCol = Math.max(...allCols);

  // 将可视坐标转换为文档位置
  const getCellPositionFromMap = (row: number, col: number): number | null => {
    const cellOffset = tableMap.map[row * tableMap.width + col];
    if (cellOffset === undefined) return null;
    return tablePos + 1 + cellOffset;
  };

  // Anchor：选区起点（外接矩形左上）
  const anchorPosition = getCellPositionFromMap(topRow, leftCol);
  if (anchorPosition === null) return;

  // Head：选区终点（通常是右下）
  let headPosition = getCellPositionFromMap(bottomRow, rightCol);
  if (headPosition === null) return;

  // 处理合并单元格的特殊情况
  if (headPosition === anchorPosition) {
    let foundDifferentCell = false;

    for (let row = bottomRow; row >= topRow && !foundDifferentCell; row--) {
      for (let col = rightCol; col >= leftCol && !foundDifferentCell; col--) {
        const candidatePosition = getCellPositionFromMap(row, col);

        if (
          candidatePosition !== null &&
          candidatePosition !== anchorPosition
        ) {
          headPosition = candidatePosition;
          foundDifferentCell = true;
        }
      }
    }
  }

  try {
    const anchorRef = state.doc.resolve(anchorPosition);
    const headRef = state.doc.resolve(headPosition);

    const cellSelection = new CellSelection(anchorRef, headRef);
    const transaction = state.tr.setSelection(cellSelection);

    return applySelectionWithMode(state, transaction, options);
  } catch (error) {
    console.error('Failed to create cell selection:', error);
    return;
  }
}

export function selectCellAt({
  editor,
  row,
  col,
  tablePos,
  dispatch,
}: {
  editor: Editor | null;
  row: number;
  col: number;
  tablePos?: number;
  dispatch?: (tr: Transaction) => void;
}): boolean {
  if (!editor) return false;

  const { state, view } = editor;
  const found = getTable(editor, tablePos);
  if (!found) return false;

  // 边界检查
  if (!isWithinBounds(row, col, found.map)) {
    return false;
  }

  const relCellPos = found.map.positionAt(row, col, found.node);
  const absCellPos = found.start + relCellPos;

  const $abs = state.doc.resolve(absCellPos);
  const $cell = cellAround($abs);
  const cellPos = $cell ? $cell.pos : absCellPos;

  const sel = CellSelection.create(state.doc, cellPos);

  const doDispatch = dispatch ?? view?.dispatch;
  if (!doDispatch) return false;

  doDispatch(state.tr.setSelection(sel));
  return true;
}

export function selectLastCell(
  editor: Editor,
  tableNode: Node,
  tablePos: number,
  orientation: Orientation
) {
  const map = TableMap.get(tableNode);
  const isRow = orientation === 'row';

  // 行选左下，列选右上
  const row = isRow ? map.height - 1 : 0;
  const col = isRow ? 0 : map.width - 1;

  // 计算索引
  const index = row * map.width + col;

  // 获取真实单元格位置（兼容合并单元格）
  const cellPos = map.map[index];
  if (!cellPos && cellPos !== 0) {
    console.warn('selectLastCell: cell position not found in map', {
      index,
      row,
      col,
      map,
    });
    return false;
  }

  // 找到实际的行列坐标
  const cellIndex = map.map.indexOf(cellPos);
  const actualRow = cellIndex >= 0 ? Math.floor(cellIndex / map.width) : 0;
  const actualCol = cellIndex >= 0 ? cellIndex % map.width : 0;

  return selectCellAt({
    editor,
    row: actualRow,
    col: actualCol,
    tablePos,
    dispatch: editor.view.dispatch.bind(editor.view),
  });
}

export function getIndexCoordinates({
  editor,
  index,
  orientation,
  tablePos,
}: {
  editor: Editor | null;
  index: number;
  orientation?: Orientation;
  tablePos?: number;
}): { row: number; col: number }[] | null {
  if (!editor) return null;

  const table = getTable(editor, tablePos);
  if (!table) return null;

  const { map } = table;
  const { width, height } = map;

  if (index < 0) return null;
  if (orientation === 'row' && index >= height) return null;
  if (orientation === 'column' && index >= width) return null;

  return orientation === 'row'
    ? Array.from({ length: map.width }, (_, col) => ({ row: index, col }))
    : Array.from({ length: map.height }, (_, row) => ({ row, col: index }));
}

export function getRowOriginCoords({
  editor,
  rowIndex,
  tablePos,
  includeMerged = false,
}: {
  editor: Editor | null;
  rowIndex: number;
  tablePos?: number;
  includeMerged?: boolean;
}): { row: number; col: number }[] | null {
  if (!editor) return null;
  const table = getTable(editor, tablePos);
  if (!table) return null;

  const coords: { row: number; col: number }[] = [];
  const seen = new Set<number>();
  const { map, node } = table;

  for (let col = 0; col < map.width; col++) {
    const cellIndex = rowIndex * map.width + col;
    const offset = map.map[cellIndex];
    if (offset === undefined || seen.has(offset)) continue;
    seen.add(offset);

    const rect = map.findCell(offset);
    if (rect.top !== rowIndex) continue;

    const cellNode = node.nodeAt(offset);
    if (!cellNode) continue;

    if (!includeMerged && isCellMerged(cellNode)) continue;

    coords.push({ row: rect.top, col: rect.left });
  }

  return coords.length ? coords : null;
}

export function getRowOriginCells(
  editor: Editor | null,
  rowIndex: number,
  tablePos?: number,
  options: { includeMerged?: boolean } = {}
): { cells: CellInfo[]; mergedCells: CellInfo[] } {
  if (!editor) return EMPTY_CELLS_RESULT;
  const table = getTable(editor, tablePos);
  if (!table) return EMPTY_CELLS_RESULT;

  const cells: CellInfo[] = [];
  const mergedCells: CellInfo[] = [];
  const { map, node, start } = table;
  const { includeMerged = false } = options;
  const seen = new Set<number>();

  for (let col = 0; col < map.width; col++) {
    const cellIndex = rowIndex * map.width + col;
    const offset = map.map[cellIndex];
    if (offset === undefined || seen.has(offset)) continue;
    seen.add(offset);

    const rect = map.findCell(offset);
    if (rect.top !== rowIndex) continue;

    const cellNode = node.nodeAt(offset);
    if (!cellNode) continue;

    const cell = createCellInfo(rect.top, rect.left, start + offset, cellNode);
    if (isCellMerged(cellNode)) {
      mergedCells.push(cell);
      if (!includeMerged) continue;
    }

    cells.push(cell);
  }

  return { cells, mergedCells };
}

export function getCellIndicesFromDOM(
  cell: HTMLTableCellElement,
  tableNode: Node | null,
  editor: Editor
): { rowIndex: number; colIndex: number } | null {
  if (!tableNode) return null;

  try {
    const cellPos = editor.view.posAtDOM(cell, 0);
    const $cellPos = editor.view.state.doc.resolve(cellPos);

    for (let d = $cellPos.depth; d > 0; d--) {
      const node = $cellPos.node(d);
      if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
        const tableMap = TableMap.get(tableNode);
        const cellNodePos = $cellPos.before(d);
        const tableStart = $cellPos.start(d - 2);
        const cellOffset = cellNodePos - tableStart;
        const cellIndex = tableMap.map.indexOf(cellOffset);

        return {
          rowIndex: Math.floor(cellIndex / tableMap.width),
          colIndex: cellIndex % tableMap.width,
        };
      }
    }
  } catch (error) {
    console.warn('Could not get cell position:', error);
  }
  return null;
}

export function getTableFromDOM(
  tableElement: HTMLElement,
  editor: Editor
): { node: Node; pos: number } | null {
  try {
    const pos = editor.view.posAtDOM(tableElement, 0);
    const $pos = editor.view.state.doc.resolve(pos);

    for (let d = $pos.depth; d >= 0; d--) {
      const node = $pos.node(d);
      if (isTableNode(node)) {
        return { node, pos: d === 0 ? 0 : $pos.before(d) };
      }
    }
  } catch (error) {
    console.warn('Could not get table from DOM:', error);
  }
  return null;
}

export function isTableNode(node: Node | null | undefined): node is Node {
  return (
    !!node &&
    (node.type.name === 'table' || node.type.spec.tableRole === 'table')
  );
}

export function getRowCells(
  editor: Editor | null,
  rowIndex?: number,
  tablePos?: number
): { cells: CellInfo[]; mergedCells: CellInfo[] } {
  return collectCells(editor, 'row', rowIndex, tablePos);
}

export function getColumnCells(
  editor: Editor | null,
  columnIndex?: number,
  tablePos?: number
): { cells: CellInfo[]; mergedCells: CellInfo[] } {
  return collectCells(editor, 'column', columnIndex, tablePos);
}

export function adjustRowspanForRowInsert(
  editor: Editor,
  tablePos: number,
  insertRowIndex: number
): boolean {
  const table = getTable(editor, tablePos);
  if (!table) return false;

  const cells = getUniqueCellsWithRect(table);
  let tr = editor.state.tr;
  let changed = false;

  cells.forEach(({ pos, node, rect }) => {
    const rowspan = node.attrs.rowspan ?? 1;
    if (rowspan > 1 && rect.top <= insertRowIndex && insertRowIndex < rect.bottom) {
      tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, rowspan: rowspan + 1 }, node.marks);
      changed = true;
    }
  });

  if (changed) {
    editor.view.dispatch(tr);
  }

  return changed;
}

export function adjustRowspanForRowDelete(
  editor: Editor,
  tablePos: number,
  deleteRowIndex: number
): boolean {
  const table = getTable(editor, tablePos);
  if (!table) return false;

  const cells = getUniqueCellsWithRect(table);
  let tr = editor.state.tr;
  let changed = false;

  cells.forEach(({ pos, node, rect }) => {
    const rowspan = node.attrs.rowspan ?? 1;
    if (rowspan > 1 && rect.top < deleteRowIndex && deleteRowIndex < rect.bottom) {
      const nextSpan = Math.max(1, rowspan - 1);
      tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, rowspan: nextSpan }, node.marks);
      changed = true;
    }
  });

  if (changed) {
    editor.view.dispatch(tr);
  }

  return changed;
}

export function rectEq(rect1: DOMRect | null, rect2: DOMRect | null): boolean {
  if (!rect1 || !rect2) return rect1 === rect2;
  const tolerance = 0.5;
  return (
    Math.abs(rect1.left - rect2.left) < tolerance &&
    Math.abs(rect1.top - rect2.top) < tolerance &&
    Math.abs(rect1.width - rect2.width) < tolerance &&
    Math.abs(rect1.height - rect2.height) < tolerance
  );
}

