import { Menu } from '../../../components';
import { ArrowDownSLineIcon, DeleteLineIcon, MergeCellsVerticalIcon, MoreLineIcon, SplitCellsVerticalIcon } from '../../../components/Icons';
import { DeleteBack2LineIcon } from '../../../components/Icons/delete-back-2-line-icon';
import { MenuItem } from '../../../types';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  CellSelection,
  cellAround,
  deleteCellSelection,
  mergeCells,
  splitCell,
} from '@tiptap/pm/tables';
import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import React, { forwardRef } from 'react';
import {
  buildTableAlignMenu,
  buildTableColorMenu,
  createTableMenuDivider,
} from '../TableHandle/menu-builders';
import { useTableMenuOpen } from '../TableHandle/use-table-menu-open';

interface TableCellHandleMenuProps
  extends React.ComponentPropsWithoutRef<'button'> {
  editor?: Editor | null;
  onOpenChange?: (isOpen: boolean) => void;
  onResizeStart?: (handle: 'br') => (event: React.MouseEvent) => void;
}

export const TableCellHandleMenu = forwardRef<
  HTMLButtonElement,
  TableCellHandleMenuProps
>(({ editor, onOpenChange, className, onResizeStart, ...props }, ref) => {
  const theme = useTheme();

  const editorState = useEditorState({
    editor: editor!,
    selector: (context) => {
      if (!context.editor) return null;
      return {
        selection: context.editor.state.selection,
        isEditable: context.editor.isEditable,
      };
    },
  });

  const { isMenuOpen, handleMenuToggle } = useTableMenuOpen({
    editor,
    onOpenChange,
  });

  const menuList = React.useMemo<MenuItem[]>(() => {
    if (!editor || !editor.isEditable) return [];

    const canMerge = (() => {
      try {
        return mergeCells(editor.state, undefined);
      } catch {
        return false;
      }
    })();

    const canSplit = (() => {
      try {
        return splitCell(editor.state, undefined);
      } catch {
        return false;
      }
    })();

    const menuItems: MenuItem[] = [];

    if (canMerge || canSplit) {
      if (canMerge) {
        menuItems.push({
          key: 'merge-cells',
          label: '合并单元格',
          icon: <MergeCellsVerticalIcon sx={{ fontSize: '1rem' }} />,
          onClick: () => {
            const { state, view } = editor;
            mergeCells(state, view.dispatch.bind(view));
          },
        });
      }

      if (canSplit) {
        menuItems.push({
          key: 'split-cell',
          label: '拆分单元格',
          icon: <SplitCellsVerticalIcon sx={{ fontSize: '1rem' }} />,
          onClick: () => {
            const { state, view } = editor;
            splitCell(state, view.dispatch.bind(view));
          },
        });
      }

      menuItems.push(createTableMenuDivider('divider1'));
    }

    menuItems.push(
      buildTableColorMenu({ editor, theme }),
      buildTableAlignMenu({ editor }),
    );

    menuItems.push({
      key: 'clear-content',
      label: '清空单元格内容',
      icon: <DeleteBack2LineIcon sx={{ fontSize: '1rem' }} />,
      onClick: () => {
        if (!editor) return;
        const { state, view } = editor;

        if (state.selection instanceof CellSelection) {
          deleteCellSelection(state, view.dispatch.bind(view));
        } else {
          const { $anchor } = state.selection;
          const cell = cellAround($anchor);
          if (cell) {
            const cellNode = state.doc.nodeAt(cell.pos);
            if (cellNode) {
              const from = cell.pos + 1;
              const to = cell.pos + cellNode.nodeSize - 1;
              if (from < to) {
                view.dispatch(state.tr.delete(from, to));
              }
            }
          }
        }
      },
      attrs: (() => {
        if (!editor) return { disabled: true };
        const { selection } = editor.state;
        if (selection instanceof CellSelection) {
          let hasContent = false;
          selection.forEachCell((cell) => {
            if (cell.content.size > 0) {
              hasContent = true;
            }
          });
          return hasContent ? {} : { disabled: true };
        } else {
          const { $anchor } = selection;
          const cell = cellAround($anchor);
          if (cell) {
            const cellNode = editor.state.doc.nodeAt(cell.pos);
            return cellNode && cellNode.content.size > 0
              ? {}
              : { disabled: true };
          }
          return { disabled: true };
        }
      })(),
    }, {
      key: 'delete-table',
      label: '删除表格',
      icon: <DeleteLineIcon sx={{ fontSize: '1rem' }} />,
      onClick: () => {
        if (!editor) return;
        editor.chain().focus().deleteTable().run();
      },
    });

    return menuItems;
  }, [editor, theme, editorState]);

  const handleButton = (
    <Box
      component="button"
      ref={ref}
      className={className}
      aria-label="Table cells option"
      aria-haspopup="menu"
      aria-expanded={isMenuOpen}
      onMouseDown={(e) => {
        e.stopPropagation();
        if (onResizeStart) {
          onResizeStart('br')(e);
        }
      }}
      sx={{
        position: 'absolute',
        top: '50%',
        right: '-8px',
        transform: 'translateY(-50%)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--mui-shape-borderRadius)',
        cursor: 'pointer',
        padding: '4px',
        width: '14px',
        height: '14px',
        zIndex: 4,
        backgroundColor: 'var(--mui-palette-primary-main)',
        '& .MuiSvgIcon-root': {
          color: 'var(--mui-palette-common-white)',
        },
      }}
      {...props}
    >
      <MoreLineIcon
        sx={{
          width: '0.75rem',
          height: '0.75rem',
        }}
      />
    </Box>
  );

  return (
    <Menu
      width={216}
      context={handleButton}
      list={menuList}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      onOpen={() => handleMenuToggle(true)}
      onClose={() => handleMenuToggle(false)}
      arrowIcon={<ArrowDownSLineIcon sx={{ fontSize: '1rem', transform: 'rotate(-90deg)' }} />}
    />
  );
});

TableCellHandleMenu.displayName = 'TableCellHandleMenu';
