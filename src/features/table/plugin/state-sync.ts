import type { Editor } from '@tiptap/core';
import { TableMap } from '@tiptap/pm/tables';
import { getTableFromDOM } from '../../../utils/table';
import {
  didReferencePositionsChange,
  getLastEdgeReferences,
  getReferenceCellRect,
} from './positioning';
import type { TableHandlesState } from './shared';

export const syncTableHandleState = ({
  editor,
  tableElement,
  state,
}: {
  editor: Editor;
  tableElement: HTMLElement;
  state: TableHandlesState;
}) => {
  const tableInfo = getTableFromDOM(tableElement, editor);
  if (!tableInfo || tableInfo.node.type.name !== 'table') {
    return null;
  }

  const tableBody = tableElement.querySelector('tbody');
  if (!tableBody) {
    throw new Error(
      "Table block does not contain a 'tbody' HTML element. This should never happen.",
    );
  }

  const { height: rowCount, width: colCount } = TableMap.get(tableInfo.node);

  let newRowIndex = state.rowIndex;
  let newColIndex = state.colIndex;

  if (newRowIndex !== undefined && newRowIndex >= rowCount) {
    newRowIndex = rowCount ? rowCount - 1 : undefined;
  }

  if (newColIndex !== undefined && newColIndex >= colCount) {
    newColIndex = colCount ? colCount - 1 : undefined;
  }

  let newReferencePosCell = getReferenceCellRect({
    tableBody,
    rowIndex: newRowIndex,
    colIndex: newColIndex,
    originalSize: state.draggingState?.originalCellSize,
  });

  if (!newReferencePosCell && newRowIndex !== undefined && newColIndex !== undefined) {
    newRowIndex = undefined;
    newColIndex = undefined;
  }

  const newReferencePosTable = tableBody.getBoundingClientRect();

  const {
    referencePosLastRow: newReferencePosLastRow,
    referencePosLastCol: newReferencePosLastCol,
  } = getLastEdgeReferences({
    tableBody,
    tableNode: tableInfo.node,
    includeLastRow: state.showAddOrRemoveRowsButton,
    includeLastColumn: state.showAddOrRemoveColumnsButton,
  });

  const nextState: TableHandlesState = {
    ...state,
    block: tableInfo.node,
    blockPos: tableInfo.pos,
    rowIndex: newRowIndex,
    colIndex: newColIndex,
    referencePosCell: newReferencePosCell,
    referencePosTable: newReferencePosTable,
    referencePosLastRow: newReferencePosLastRow,
    referencePosLastCol: newReferencePosLastCol,
  };

  const blockChanged = state.block !== tableInfo.node || state.blockPos !== tableInfo.pos;
  const indicesChanged = newRowIndex !== state.rowIndex || newColIndex !== state.colIndex;
  const refPosChanged = didReferencePositionsChange({
    previous: state,
    next: nextState,
  });

  return {
    nextState,
    blockChanged,
    indicesChanged,
    refPosChanged,
  };
};
