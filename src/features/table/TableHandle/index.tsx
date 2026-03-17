import { FloatingPortal } from '@floating-ui/react';
import type { Editor } from '@tiptap/react';
import React, { useMemo } from 'react';
import {
  colDragStart,
  rowDragStart,
} from '../plugin/drag-helpers';
import { TableHandleGroup } from './table-handle-group';
import { useTableHandlePositioning } from './use-table-handle-positioning';
import { useTableHandleState } from './use-table-handle-state';
import { useTableHandleVisibility } from './use-table-handle-visibility';

export interface TableHandleProps {
  /** Tiptap 编辑器实例 */
  editor?: Editor | null;
}

/** 负责行/列手柄、扩展按钮与菜单的定位与渲染 */
export function TableHandle({
  editor: providedEditor,
}: TableHandleProps) {
  const editor = providedEditor;
  const state = useTableHandleState({ editor });

  const draggingState = useMemo(() => {
    if (!state?.draggingState) return undefined;

    return {
      draggedCellOrientation: state.draggingState.draggedCellOrientation,
      mousePos: state.draggingState.mousePos,
      initialOffset: state.draggingState.initialOffset,
    };
  }, [state?.draggingState]);

  const { rowHandle, colHandle } = useTableHandlePositioning(
    state?.show || false,
    state?.referencePosCell || null,
    state?.referencePosTable || null,
    draggingState
  );

  const hasValidRowIndex = typeof state?.rowIndex === 'number';
  const hasValidColIndex = typeof state?.colIndex === 'number';
  const {
    shouldShowRow,
    shouldShowColumn,
    toggleRowVisibility,
    toggleColumnVisibility,
    handleMenuOpenChange,
  } = useTableHandleVisibility({
    hasValidRowIndex,
    hasValidColIndex,
    rowMounted: rowHandle.isMounted,
    colMounted: colHandle.isMounted,
  });

  if (!editor || !state) return null;

  const rootElement = state.widgetContainer || document.body;

  return (
    <FloatingPortal root={rootElement}>
      {shouldShowRow && (
        <div ref={rowHandle.ref} style={rowHandle.style}>
          <TableHandleGroup
            editor={editor}
            orientation="row"
            index={state.rowIndex}
            tablePos={state.blockPos}
            tableNode={state.block}
            onToggleOtherHandle={toggleColumnVisibility}
            dragStart={rowDragStart}
            onOpenChange={(open) => handleMenuOpenChange('row', open)}
          />
        </div>
      )}
      {shouldShowColumn && (
        <div ref={colHandle.ref} style={colHandle.style}>
          <TableHandleGroup
            editor={editor}
            orientation="column"
            index={state.colIndex}
            tablePos={state.blockPos}
            tableNode={state.block}
            onToggleOtherHandle={toggleRowVisibility}
            dragStart={colDragStart}
            onOpenChange={(open) => handleMenuOpenChange('column', open)}
          />
        </div>
      )}
    </FloatingPortal >
  );
}

TableHandle.displayName = 'TableHandle';
