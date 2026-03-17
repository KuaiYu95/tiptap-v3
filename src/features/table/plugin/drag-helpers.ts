import type { Editor } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { CellSelection } from '@tiptap/pm/tables';
import {
  getTableFromDOM,
  isTableNode,
  safeClosest,
} from '../../../utils/table';
import { createTableDragImage } from './create-image';
import {
  getTableHandleRuntime,
  tableHandlePluginKey,
  TableHandlesState,
} from './shared';

interface TableDragEvent {
  dataTransfer: DataTransfer | null;
  currentTarget: EventTarget & Element;
  clientX: number;
  clientY: number;
}

const disableDrag = (event: TableDragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'none';
  }
};

const recoverStateFromDataset = (
  editor: Editor,
  handleElement: HTMLElement,
  orientation: 'col' | 'row',
): TableHandlesState | null => {
  const dataIndex = handleElement.dataset.tableIndex;
  const dataTablePos = handleElement.dataset.tablePos;

  if (!dataIndex || !dataTablePos) {
    return null;
  }

  const index = Number.parseInt(dataIndex, 10);
  const blockPos = Number.parseInt(dataTablePos, 10);

  if (Number.isNaN(index) || Number.isNaN(blockPos)) {
    return null;
  }

  const tableNode = editor.state.doc.nodeAt(blockPos);
  if (!tableNode || !isTableNode(tableNode)) {
    return null;
  }

  const tableWrapper = safeClosest<HTMLElement>(handleElement, '.tableWrapper');
  const tbody = tableWrapper?.querySelector('tbody');
  if (!tbody) {
    return null;
  }

  const tableRect = tbody.getBoundingClientRect();
  return {
    show: true,
    showAddOrRemoveRowsButton: false,
    showAddOrRemoveColumnsButton: false,
    referencePosTable: tableRect,
    block: tableNode,
    blockPos,
    colIndex: orientation === 'col' ? index : undefined,
    rowIndex: orientation === 'row' ? index : undefined,
    referencePosCell: undefined,
    widgetContainer: undefined,
  };
};

const recoverStateFromDom = (
  editor: Editor,
  handleElement: HTMLElement,
  orientation: 'col' | 'row',
): TableHandlesState | null => {
  const tableWrapper = safeClosest<HTMLElement>(handleElement, '.tableWrapper');
  if (!tableWrapper) {
    return null;
  }

  const tableInfo = getTableFromDOM(tableWrapper, editor);
  if (!tableInfo) {
    return null;
  }

  const tbody = tableWrapper.querySelector('tbody');
  if (!tbody) {
    return null;
  }

  const tableRect = tbody.getBoundingClientRect();
  const handleRect = handleElement.getBoundingClientRect();

  let approximateIndex = 0;
  if (orientation === 'row') {
    const rowHeight = tableRect.height / tableInfo.node.content.childCount;
    approximateIndex = Math.floor((handleRect.top - tableRect.top) / rowHeight);
  } else {
    const colWidth = tableRect.width / (tableInfo.node.content.firstChild?.content.childCount ?? 1);
    approximateIndex = Math.floor((handleRect.left - tableRect.left) / colWidth);
  }

  return {
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
};

const ensureTableState = (
  editor: Editor,
  event: TableDragEvent,
  orientation: 'col' | 'row',
): TableHandlesState | null => {
  const runtime = getTableHandleRuntime();
  if (!runtime) {
    return null;
  }

  if (runtime.state) {
    return runtime.state;
  }

  const handleElement = event.currentTarget as HTMLElement;
  runtime.state =
    recoverStateFromDataset(editor, handleElement, orientation) ||
    recoverStateFromDom(editor, handleElement, orientation) ||
    undefined;

  return runtime.state ?? null;
};

const tableDragStart = (orientation: 'col' | 'row', event: TableDragEvent) => {
  const runtime = getTableHandleRuntime();
  if (!runtime) {
    disableDrag(event);
    return;
  }

  if (!runtime.editor.isEditable) {
    disableDrag(event);
    return;
  }

  const state = ensureTableState(runtime.editor, event, orientation);
  if (!state) {
    disableDrag(event);
    return;
  }

  const index = orientation === 'col' ? state.colIndex : state.rowIndex;
  if (index === undefined) {
    disableDrag(event);
    return;
  }

  const { blockPos, referencePosCell } = state;
  const mousePos = orientation === 'col' ? event.clientX : event.clientY;

  if (runtime.editor.state.selection instanceof CellSelection) {
    const safeSel = TextSelection.near(runtime.editor.state.doc.resolve(blockPos), 1);
    runtime.editor.view.dispatch(runtime.editor.state.tr.setSelection(safeSel));
  }

  const dragImage = createTableDragImage(runtime.editor, orientation, index, blockPos);

  if (event.dataTransfer) {
    const handleRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const offset =
      orientation === 'col'
        ? { x: handleRect.width / 2, y: 0 }
        : { x: 0, y: handleRect.height / 2 };

    event.dataTransfer.effectAllowed = orientation === 'col' ? 'move' : 'copyMove';
    event.dataTransfer.setDragImage(dragImage, offset.x, offset.y);
  }

  const cleanup = () => dragImage.parentNode?.removeChild(dragImage);
  document.addEventListener('drop', cleanup, { once: true });
  document.addEventListener('dragend', cleanup, { once: true });

  const initialOffset = referencePosCell
    ? (orientation === 'col' ? referencePosCell.left : referencePosCell.top) - mousePos
    : 0;

  const originalCellSize = referencePosCell
    ? { width: referencePosCell.width, height: referencePosCell.height }
    : undefined;

  runtime.state = {
    ...state,
    draggingState: {
      draggedCellOrientation: orientation,
      originalIndex: index,
      mousePos,
      initialOffset,
      originalCellSize,
    },
  };
  runtime.emitUpdate();
  runtime.editor.view.dispatch(runtime.editor.state.tr.setMeta(tableHandlePluginKey, true));
};

export const colDragStart = (event: {
  dataTransfer: DataTransfer | null;
  currentTarget: EventTarget & Element;
  clientX: number;
}) => tableDragStart('col', { ...event, clientY: 0 });

export const rowDragStart = (event: {
  dataTransfer: DataTransfer | null;
  currentTarget: EventTarget & Element;
  clientY: number;
}) => tableDragStart('row', { ...event, clientX: 0 });

export const dragEnd = () => {
  const runtime = getTableHandleRuntime();
  if (!runtime || runtime.state === undefined) {
    return;
  }

  runtime.state = {
    ...runtime.state,
    draggingState: undefined,
  };
  runtime.emitUpdate();
  runtime.editor.view.dispatch(runtime.editor.state.tr.setMeta(tableHandlePluginKey, null));
};
