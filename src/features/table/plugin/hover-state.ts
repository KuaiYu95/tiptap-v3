import type { Node as TiptapNode } from '@tiptap/pm/model';
import type { TableHandlesState } from './shared';

export const buildWrapperHoverState = ({
  previousState,
  tableRect,
  referencePosLastRow,
  referencePosLastCol,
  block,
  blockPos,
  widgetContainer,
  keepColIndex,
  nextRowIndex,
  nextReferencePosCell,
  resetIndices,
}: {
  previousState?: TableHandlesState;
  tableRect: DOMRect;
  referencePosLastRow?: DOMRect;
  referencePosLastCol?: DOMRect;
  block: TiptapNode;
  blockPos: number;
  widgetContainer?: HTMLElement;
  keepColIndex?: number;
  nextRowIndex?: number;
  nextReferencePosCell?: DOMRect;
  resetIndices: boolean;
}): TableHandlesState => ({
  ...previousState,
  show: true,
  showAddOrRemoveRowsButton: !!referencePosLastRow,
  showAddOrRemoveColumnsButton: !!referencePosLastCol,
  referencePosTable: tableRect,
  referencePosLastRow,
  referencePosLastCol,
  block,
  blockPos,
  widgetContainer,
  colIndex: resetIndices ? undefined : keepColIndex,
  rowIndex: resetIndices ? undefined : nextRowIndex ?? previousState?.rowIndex,
  referencePosCell: resetIndices
    ? undefined
    : nextReferencePosCell ?? previousState?.referencePosCell,
});

export const buildCellHoverState = ({
  tableRect,
  referencePosLastRow,
  referencePosLastCol,
  block,
  blockPos,
  widgetContainer,
  draggingState,
  referencePosCell,
  colIndex,
  rowIndex,
}: {
  tableRect: DOMRect;
  referencePosLastRow?: DOMRect;
  referencePosLastCol?: DOMRect;
  block: TiptapNode;
  blockPos: number;
  widgetContainer?: HTMLElement;
  draggingState?: TableHandlesState['draggingState'];
  referencePosCell: DOMRect;
  colIndex: number;
  rowIndex: number;
}): TableHandlesState => ({
  show: true,
  showAddOrRemoveColumnsButton: !!referencePosLastCol,
  showAddOrRemoveRowsButton: !!referencePosLastRow,
  referencePosTable: tableRect,
  referencePosLastRow,
  referencePosLastCol,
  block,
  blockPos,
  draggingState,
  referencePosCell,
  colIndex,
  rowIndex,
  widgetContainer,
});
