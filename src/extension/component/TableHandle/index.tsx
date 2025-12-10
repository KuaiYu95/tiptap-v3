import { FloatingPortal } from '@floating-ui/react';
import type { Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/react';
import React, { useCallback, useMemo, useState } from 'react';
import type { Orientation } from '../../../util/table-utils';
import {
  colDragStart,
  rowDragStart,
} from '../../node/TableHandler/plugin';
import { TableHandleAddButton } from './TableHandleAddButton';
import { TableHandleMenu } from './TableHandleMenu';
import { useTableHandlePositioning } from './use-table-handle-positioning';
import { useTableHandleState } from './use-table-handle-state';

export interface TableHandleButtonProps {
  editor: Editor;
  orientation: Orientation;
  index?: number;
  tablePos?: number;
  tableNode?: Node;
  onToggleOtherHandle?: (visible: boolean) => void;
  onOpenChange?: (open: boolean) => void;
  dragStart?: (e: React.DragEvent) => void;
}

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

  const [isRowVisible, setIsRowVisible] = useState(true);
  const [isColumnVisible, setIsColumnVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState<null | 'row' | 'column'>(null);

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

  const toggleRowVisibility = useCallback((visible: boolean) => {
    setIsRowVisible(visible);
  }, []);

  const toggleColumnVisibility = useCallback((visible: boolean) => {
    setIsColumnVisible(visible);
  }, []);

  const handleMenuOpenChange = useCallback((type: 'row' | 'column', open: boolean) => {
    setMenuOpen(open ? type : null);
  }, []);

  if (!editor || !state) return null;

  const hasValidRowIndex = typeof state.rowIndex === 'number';
  const hasValidColIndex = typeof state.colIndex === 'number';

  const shouldShowRow =
    (isRowVisible && rowHandle.isMounted && hasValidRowIndex) ||
    menuOpen === 'row';

  const shouldShowColumn =
    (isColumnVisible && colHandle.isMounted && hasValidColIndex) ||
    menuOpen === 'column';

  const rootElement = state.widgetContainer || document.body;

  return (
    <FloatingPortal root={rootElement}>
      {shouldShowRow && (
        <div ref={rowHandle.ref} style={rowHandle.style}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem',
              width: '0.75rem',
              height: 'var(--table-handle-ref-height, 40px)',
            }}
          >
            <TableHandleAddButton
              editor={editor}
              orientation="row"
              index={state.rowIndex}
              tablePos={state.blockPos}
              tableNode={state.block}
              direction="before"
            />
            <TableHandleMenu
              editor={editor}
              orientation="row"
              index={state.rowIndex}
              tablePos={state.blockPos}
              tableNode={state.block}
              onToggleOtherHandle={toggleColumnVisibility}
              dragStart={rowDragStart}
              onOpenChange={(open) => handleMenuOpenChange('row', open)}
            />
            <TableHandleAddButton
              editor={editor}
              orientation="row"
              index={state.rowIndex}
              tablePos={state.blockPos}
              tableNode={state.block}
              direction="after"
            />
          </div>
        </div>
      )}
      {shouldShowColumn && (
        <div ref={colHandle.ref} style={colHandle.style}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '0.125rem',
              height: '0.75rem',
              width: 'var(--table-handle-ref-width, 100px)',
            }}
          >
            <TableHandleAddButton
              editor={editor}
              orientation="column"
              index={state.colIndex}
              tablePos={state.blockPos}
              tableNode={state.block}
              direction="before"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <TableHandleMenu
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
            <TableHandleAddButton
              editor={editor}
              orientation="column"
              index={state.colIndex}
              tablePos={state.blockPos}
              tableNode={state.block}
              direction="after"
            />
          </div>
        </div>
      )}
    </FloatingPortal >
  );
}

TableHandle.displayName = 'TableHandle';

