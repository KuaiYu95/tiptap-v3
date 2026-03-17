import type { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { getColumnCells, getRowCells } from '../../../utils/table';
import type { TableHandlesState } from './shared';

const createDropCursor = (
  orientation: 'row' | 'col',
  movedForward: boolean,
) => {
  const widget = document.createElement('div');
  widget.className = 'tiptap-table-dropcursor';
  widget.style.position = 'absolute';
  widget.style.zIndex = '20';
  widget.style.pointerEvents = 'none';
  widget.style.backgroundColor = 'var(--mui-palette-primary-main, #1976d2)';

  if (orientation === 'row') {
    widget.style.left = '0';
    widget.style.right = '0';
    widget.style.height = '3px';

    if (movedForward) {
      widget.style.bottom = '-1px';
    } else {
      widget.style.top = '-1px';
    }
  } else {
    widget.style.top = '0';
    widget.style.bottom = '0';
    widget.style.width = '3px';

    if (movedForward) {
      widget.style.right = '-1px';
    } else {
      widget.style.left = '-1px';
    }
  }

  return widget;
};

const addDraggingSourceDecorations = (
  editor: Editor,
  tableState: TableHandlesState,
  originalIndex: number,
  decorations: Decoration[],
) => {
  const cells =
    tableState.draggingState?.draggedCellOrientation === 'row'
      ? getRowCells(editor, originalIndex, tableState.blockPos).cells
      : getColumnCells(editor, originalIndex, tableState.blockPos).cells;

  cells.forEach((cell) => {
    if (!cell.node) {
      return;
    }

    decorations.push(
      Decoration.node(cell.pos, cell.pos + cell.node.nodeSize, {
        class: 'table-cell-dragging-source',
      }),
    );
  });
};

const addDropCursorDecorations = (
  editor: Editor,
  tableState: TableHandlesState,
  newIndex: number,
  originalIndex: number,
  decorations: Decoration[],
) => {
  const orientation = tableState.draggingState?.draggedCellOrientation;
  if (!orientation) {
    return;
  }

  const movedForward = newIndex > originalIndex;
  const cells =
    orientation === 'row'
      ? getRowCells(editor, newIndex, tableState.blockPos).cells
      : getColumnCells(editor, newIndex, tableState.blockPos).cells;

  cells.forEach((cell) => {
    const cellNode = cell.node;
    if (!cellNode) {
      return;
    }

    const decorationPos = cell.pos + (movedForward ? cellNode.nodeSize - 2 : 2);
    decorations.push(
      Decoration.widget(decorationPos, () => createDropCursor(orientation, movedForward)),
    );
  });
};

export const buildTableDragDecorations = ({
  editor,
  doc,
  tableState,
}: {
  editor: Editor;
  doc: ProseMirrorNode;
  tableState?: TableHandlesState;
}) => {
  if (!tableState?.draggingState) {
    return null;
  }

  const newIndex =
    tableState.draggingState.draggedCellOrientation === 'row'
      ? tableState.rowIndex
      : tableState.colIndex;

  if (newIndex === undefined) {
    return null;
  }

  const decorations: Decoration[] = [];
  const { originalIndex } = tableState.draggingState;

  addDraggingSourceDecorations(editor, tableState, originalIndex, decorations);

  if (newIndex !== originalIndex) {
    addDropCursorDecorations(editor, tableState, newIndex, originalIndex, decorations);
  }

  return DecorationSet.create(doc, decorations);
};
