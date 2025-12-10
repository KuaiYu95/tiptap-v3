import { SkipDownIcon, SkipLeftIcon, SkipRightIcon, SkipUpIcon } from '@ctzhian/tiptap/component/Icons';
import { Box } from '@mui/material';
import type { Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/react';
import React, { useCallback } from 'react';
import type { Orientation } from '../../../util/table-utils';
import { selectCellsByCoords } from '../../../util/table-utils';

interface TableHandleAddButtonProps {
  editor?: Editor | null;
  orientation: Orientation;
  index?: number;
  tableNode?: Node;
  tablePos?: number;
  direction: 'before' | 'after';
}

export const TableHandleAddButton = ({
  editor,
  orientation,
  index,
  tableNode,
  tablePos,
  direction,
}: TableHandleAddButtonProps) => {
  const handleClick = useCallback(() => {
    if (
      !editor ||
      !tableNode ||
      typeof tablePos !== 'number' ||
      typeof index !== 'number'
    ) {
      return;
    }

    try {
      if (orientation === 'row') {
        selectCellsByCoords(
          editor,
          tablePos,
          [{ row: index, col: 0 }],
          {
            mode: 'dispatch',
            dispatch: editor.view.dispatch.bind(editor.view),
          }
        );
      } else {
        const cellCoord = { row: 0, col: index };
        selectCellsByCoords(editor, tablePos, [cellCoord], {
          mode: 'dispatch',
          dispatch: editor.view.dispatch.bind(editor.view),
        });
      }

      if (orientation === 'row') {
        editor.chain().focus()[direction === 'before' ? 'addRowBefore' : 'addRowAfter']().run();
      } else {
        editor.chain().focus()[direction === 'before' ? 'addColumnBefore' : 'addColumnAfter']().run();
      }
    } catch (error) {
      console.warn('Failed to add row/column:', error);
    }
  }, [editor, orientation, index, tableNode, tablePos, direction]);

  if (!editor?.isEditable) return null;

  const Icon = orientation === 'row'
    ? (direction === 'before' ? SkipUpIcon : SkipDownIcon)
    : (direction === 'before' ? SkipLeftIcon : SkipRightIcon);

  const ariaLabel = orientation === 'row'
    ? (direction === 'before' ? '上方插入行' : '下方插入行')
    : (direction === 'before' ? '左侧插入列' : '右侧插入列');

  return (
    <Box
      component="button"
      className="tiptap-table-add-button"
      onClick={handleClick}
      sx={{
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--mui-palette-background-paper3)',
        borderRadius: 'var(--mui-shape-borderRadius)',
        cursor: 'pointer',
        padding: 0,
        width: orientation === 'row' ? '0.75rem' : '2rem',
        height: '0.75rem',
        transition: 'background-color 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: 'var(--mui-palette-primary-main)',
          '& .MuiSvgIcon-root': {
            color: 'var(--mui-palette-common-white)',
          },
        },
      }}
      aria-label={ariaLabel}
    >
      <Icon sx={{ width: '0.75rem', height: '0.75rem', flexShrink: 0 }} />
    </Box>
  );
};

