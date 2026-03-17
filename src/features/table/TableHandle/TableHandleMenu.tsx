import {
  ArrowDownSLineIcon,
  DeleteColumnIcon, DeleteLineIcon, DeleteRowIcon,
  FileCopyLineIcon,
  InsertColumnLeftIcon,
  InsertColumnRightIcon, InsertRowBottomIcon, InsertRowTopIcon,
  LayoutLeft2LineIcon,
  LayoutTop2LineIcon,
} from '../../../components/Icons';
import { DeleteBack2LineIcon } from '../../../components/Icons/delete-back-2-line-icon';
import { Box, useTheme } from '@mui/material';
import type { Node } from '@tiptap/pm/model';
import type { EditorState, Transaction } from '@tiptap/pm/state';
import { addColumnAfter, CellSelection, deleteCellSelection, TableMap } from '@tiptap/pm/tables';
import type { Editor } from '@tiptap/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MoreLineIcon } from '../../../components/Icons/more-line-icon';
import Menu from '../../../components/Menu';
import type { MenuItem } from '../../../types';
import type { CellInfo, CellWithRect, Orientation } from '../../../utils/table';
import {
  getColumnCells,
  getIndexCoordinates,
  getRowCells,
  getRowOriginCoords,
  getTable,
  getUniqueCellsWithRect,
  selectCellsByCoords
} from '../../../utils/table';
import { dragEnd } from '../plugin/drag-helpers';
import {
  buildTableAlignMenu,
  buildTableColorMenu,
  createTableMenuDivider,
} from './menu-builders';
import { useTableMenuOpen } from './use-table-menu-open';
import './TableHandleMenu.css';

interface TableHandleMenuProps {
  editor?: Editor | null;
  orientation: Orientation;
  index?: number;
  tableNode?: Node;
  tablePos?: number;
  onToggleOtherHandle?: (visible: boolean) => void;
  onOpenChange?: (open: boolean) => void;
  dragStart?: (e: React.DragEvent) => void;
}

export const TableHandleMenu = ({
  editor,
  orientation,
  index,
  tableNode,
  tablePos,
  onToggleOtherHandle,
  onOpenChange,
  dragStart,
}: TableHandleMenuProps) => {
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);

  const dedupeCells = useCallback((cells: CellInfo[]) => {
    const seen = new Set<number>();
    return cells.filter((cell) => {
      if (seen.has(cell.pos)) return false;
      seen.add(cell.pos);
      return true;
    });
  }, []);

  const selectRowOrColumn = useCallback(() => {
    if (
      !editor ||
      !tableNode ||
      typeof tablePos !== 'number' ||
      typeof index !== 'number'
    )
      return;

    try {
      if (orientation === 'row') {
        const coords = getRowOriginCoords({
          editor,
          rowIndex: index,
          tablePos,
          includeMerged: false,
        });
        if (!coords) return;
        selectCellsByCoords(editor, tablePos, coords, {
          mode: 'dispatch',
          dispatch: editor.view.dispatch.bind(editor.view),
        });
      } else {
        const { width, height } = TableMap.get(tableNode);
        const start = { row: 0, col: index };
        const end = { row: height - 1, col: index };

        selectCellsByCoords(editor, tablePos, [start, end], {
          mode: 'dispatch',
          dispatch: editor.view.dispatch.bind(editor.view),
        });
      }
    } catch (error) {
      console.warn('Failed to select row/column:', error);
    }
  }, [editor, tableNode, tablePos, orientation, index]);

  const canDuplicate = useMemo(() => {
    if (!editor || typeof index !== 'number' || typeof tablePos !== 'number') {
      return false;
    }

    try {
      if (orientation === 'row') {
        const rowCells = getRowCells(editor, index, tablePos);
        return dedupeCells(rowCells.cells).length > 0;
      }

      const cells = getColumnCells(editor, index, tablePos);
      return dedupeCells(cells.cells).length > 0 && cells.mergedCells.length === 0;
    } catch {
      return false;
    }
  }, [dedupeCells, editor, index, orientation, tablePos, tableNode, editor?.state.doc]);

  const duplicateRowOrColumn = useCallback(() => {
    if (!editor || typeof index !== 'number' || typeof tablePos !== 'number' || !canDuplicate) {
      return;
    }

    try {
      // 添加新行/列
      if (orientation === 'row') {
        selectRowOrColumn();
        const added = editor.chain().focus().addRowAfter().run();
        if (!added) return;
      } else {
        selectRowOrColumn();
        let addSuccess = false;
        if (editor.state.selection instanceof CellSelection) {
          addSuccess = editor.chain().focus().addColumnAfter().run();
        } else {
          const sourceCoords = getIndexCoordinates({
            editor,
            index,
            orientation,
            tablePos,
          });
          if (!sourceCoords) return;

          const stateWithCellSel = selectCellsByCoords(editor, tablePos, sourceCoords, {
            mode: 'state',
          });
          if (!stateWithCellSel) return;

          const dispatch = (tr: Transaction) => editor.view.dispatch(tr);
          addSuccess = addColumnAfter(stateWithCellSel as EditorState, dispatch);
        }

        if (!addSuccess) return;
      }

      const updatedTable = getTable(editor, tablePos);
      if (!updatedTable) return;

      // 获取新添加的行/列中的单元格
      const newCells = orientation === 'row'
        ? dedupeCells(getRowCells(editor, index + 1, updatedTable.pos).cells)
        : dedupeCells(getColumnCells(editor, index + 1, updatedTable.pos).cells);

      // 获取要复制的原始行/列中的单元格
      const originalCells = orientation === 'row'
        ? dedupeCells(getRowCells(editor, index, tablePos).cells)
        : dedupeCells(getColumnCells(editor, index, tablePos).cells);

      if (newCells.length === 0 || originalCells.length === 0) return;

      const { state, view } = editor;
      let tr = state.tr;

      // 处理合并单元格
      const table = getTable(editor, tablePos);
      let cellsToSkip = new Set<number>(); // 记录要跳过的单元格位置

      if (table && orientation === 'row') {
        const cellsWithRect = getUniqueCellsWithRect(table);

        cellsWithRect.forEach((cell: CellWithRect) => {
          const { pos, node, rect } = cell;
          const rowspan = node.attrs.rowspan ?? 1;
          const colspan = rect.right - rect.left;

          if (rowspan > 1 && rect.top === index) {
            tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, rowspan: rowspan + 1 }, node.marks);
          }
          else if (rowspan > 1 && rect.top < index && index < rect.bottom) {
            // 记录被纵向合并覆盖的每一列，注意合并单元格可能横跨多列
            for (let col = rect.left; col < rect.left + colspan; col++) {
              cellsToSkip.add(col);
            }
          }
        });
      }

      // 按列号建立映射，保证合并（横跨多列）时能精确匹配原始单元格
      const originalCellByColumn = new Map<number, CellInfo>();
      originalCells.forEach((cell) => {
        originalCellByColumn.set(cell.column, cell);
      });

      const cellsToReplace = [...newCells].reverse();

      cellsToReplace.forEach((newCell, reverseIndex) => {
        const originalCell = originalCellByColumn.get(newCell.column);
        if (newCell.node && originalCell?.node) {
          // 使用实际列索引判断是否需要跳过被合并覆盖的单元格，避免反向遍历导致错位
          const shouldSkip = orientation === 'row' && cellsToSkip.has(newCell.column);
          if (shouldSkip) {
            return;
          }

          const duplicatedCell = newCell.node.type.create(
            { ...originalCell.node.attrs },
            originalCell.node.content,
            originalCell.node.marks
          );

          const cellEnd = newCell.pos + newCell.node.nodeSize;
          tr = tr.replaceWith(newCell.pos, cellEnd, duplicatedCell);
        }
      });

      if (tr.docChanged) {
        view.dispatch(tr);
      }
    } catch (error) {
      console.error('Error duplicating row/column:', error);
    }
  }, [editor, index, orientation, tablePos, canDuplicate, selectRowOrColumn]);

  const [isHeader, setIsHeader] = useState(false);

  useEffect(() => {
    if (!editor || typeof index !== 'number' || typeof tablePos !== 'number') {
      setIsHeader(false);
      return;
    }

    try {
      const cells = orientation === 'row'
        ? getRowCells(editor, index, tablePos)
        : getColumnCells(editor, index, tablePos);

      if (cells.cells.length === 0) {
        setIsHeader(false);
        return;
      }

      const allHeaders = cells.cells.every(cell => cell?.node?.type.name === 'tableHeader');
      setIsHeader(allHeaders);
    } catch {
      setIsHeader(false);
    }
  }, [editor, index, orientation, tablePos, tableNode, editor?.state.doc, editor?.state.selection]);

  const isFirstRowOrColumn = typeof index === 'number' && index === 0;

  const menuList = useMemo<MenuItem[]>(() => {
    if (!editor) return [];

    const menuItems: MenuItem[] = [
    ];

    if (isFirstRowOrColumn) {
      menuItems.push(
        {
          key: 'toggle-header',
          label: isHeader
            ? (orientation === 'row' ? '取消行表头' : '取消列表头')
            : (orientation === 'row' ? '切换行表头' : '切换列表头'),
          icon: isHeader ? <LayoutLeft2LineIcon sx={{ fontSize: '1rem' }} /> : <LayoutTop2LineIcon sx={{ fontSize: '1rem' }} />,
          onClick: () => {
            selectRowOrColumn();
            if (orientation === 'row') {
              editor.chain().focus().toggleHeaderRow().run();
            } else {
              editor.chain().focus().toggleHeaderColumn().run();
            }
          },
        },
        createTableMenuDivider('divider2'),
      );
    }

    menuItems.push(
      {
        key: 'add-before',
        label: orientation === 'row' ? '上方插入行' : '左侧插入列',
        icon: orientation === 'row' ? <InsertRowTopIcon sx={{ fontSize: '1rem' }} /> : <InsertColumnLeftIcon sx={{ fontSize: '1rem' }} />,
        onClick: () => {
          if (editor && typeof index === 'number' && typeof tablePos === 'number') {
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
          }

          if (orientation === 'row') {
            editor.chain().focus().addRowBefore().run();
          } else {
            editor.chain().focus().addColumnBefore().run();
          }
        },
      },
      {
        key: 'add-after',
        label: orientation === 'row' ? '下方插入行' : '右侧插入列',
        icon: orientation === 'row' ? <InsertRowBottomIcon sx={{ fontSize: '1rem' }} /> : <InsertColumnRightIcon sx={{ fontSize: '1rem' }} />,
        onClick: () => {
          if (editor && typeof index === 'number' && typeof tablePos === 'number') {
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
          }

          if (orientation === 'row') {
            editor.chain().focus().addRowAfter().run();
          } else {
            editor.chain().focus().addColumnAfter().run();
          }
        },
      },
      createTableMenuDivider('divider1'),
      buildTableColorMenu({
        editor,
        theme,
        beforeApply: selectRowOrColumn,
      }),
      buildTableAlignMenu({
        editor,
        beforeApply: selectRowOrColumn,
      }),
      {
        key: 'clear-content',
        label: orientation === 'row' ? '清空当前行内容' : '清空当前列内容',
        icon: <DeleteBack2LineIcon sx={{ fontSize: '1rem' }} />,
        onClick: () => {
          if (!editor || typeof index !== 'number' || typeof tablePos !== 'number' || !tableNode) return;
          const { state, view } = editor;

          try {
            const { width, height } = TableMap.get(tableNode);
            const start =
              orientation === 'row' ? { row: index, col: 0 } : { row: 0, col: index };
            const end =
              orientation === 'row'
                ? { row: index, col: width - 1 }
                : { row: height - 1, col: index };

            const stateWithSelection = selectCellsByCoords(editor, tablePos, [start, end], {
              mode: 'state',
            }) as EditorState | undefined;

            if (stateWithSelection && stateWithSelection.selection instanceof CellSelection) {
              deleteCellSelection(stateWithSelection, view.dispatch.bind(view));
            }
          } catch (error) {
            console.warn('Failed to clear row/column content:', error);
          }
        },
        attrs: (() => {
          if (!editor || typeof index !== 'number' || typeof tablePos !== 'number') {
            return { disabled: true };
          }

          try {
            const cells = orientation === 'row'
              ? getRowCells(editor, index, tablePos)
              : getColumnCells(editor, index, tablePos);

            if (cells.cells.length === 0) {
              return { disabled: true };
            }

            let hasContent = false;
            for (const cell of cells.cells) {
              if (cell.node && cell.node.content.size > 0) {
                hasContent = true;
                break;
              }
            }

            return hasContent ? {} : { disabled: true };
          } catch {
            return { disabled: true };
          }
        })(),
      },
      createTableMenuDivider('divider3'),
      {
        key: 'duplicate',
        label: orientation === 'row' ? '复制当前行' : '复制当前列',
        icon: <FileCopyLineIcon sx={{ fontSize: '1rem' }} />,
        onClick: duplicateRowOrColumn,
        attrs: canDuplicate ? {} : { disabled: true },
      },
      {
        key: 'delete',
        label: orientation === 'row' ? '删除当前行' : '删除当前列',
        icon: orientation === 'row' ? <DeleteRowIcon sx={{ fontSize: '1rem' }} /> : <DeleteColumnIcon sx={{ fontSize: '1rem' }} />,
        onClick: () => {
          if (orientation === 'row') {
            editor.chain().focus().deleteRow().run();
          } else {
            editor.chain().focus().deleteColumn().run();
          }
        },
      },
      {
        key: 'delete-table',
        label: '删除表格',
        icon: <DeleteLineIcon sx={{ fontSize: '1rem' }} />,
        onClick: () => {
          if (!editor || typeof tablePos !== 'number' || !tableNode) return;
          editor.chain().focus().deleteTable().run();
        },
      }
    );

    return menuItems;
  }, [editor, orientation, isFirstRowOrColumn, isHeader, selectRowOrColumn, canDuplicate, duplicateRowOrColumn]);

  const handleMenuOpenSideEffects = useCallback(() => {
    if (!editor) return;

    selectRowOrColumn();
    onToggleOtherHandle?.(false);

    if (typeof index !== 'number' || typeof tablePos !== 'number') {
      return;
    }

    try {
      const cells = orientation === 'row'
        ? getRowCells(editor, index, tablePos)
        : getColumnCells(editor, index, tablePos);

      if (cells.cells.length > 0) {
        const allHeaders = cells.cells.every(cell => cell?.node?.type.name === 'tableHeader');
        setIsHeader(allHeaders);
      }
    } catch {
    }
  }, [editor, index, onToggleOtherHandle, orientation, selectRowOrColumn, tablePos]);

  const handleMenuCloseSideEffects = useCallback(() => {
    onToggleOtherHandle?.(true);
  }, [onToggleOtherHandle]);

  const { handleMenuToggle } = useTableMenuOpen({
    editor,
    onOpenChange,
    onOpen: handleMenuOpenSideEffects,
    onClose: handleMenuCloseSideEffects,
  });

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      setIsDragging(true);
      if (e.currentTarget instanceof HTMLElement) {
        if (typeof index === 'number') {
          e.currentTarget.dataset.tableIndex = String(index);
        }
        if (typeof tablePos === 'number') {
          e.currentTarget.dataset.tablePos = String(tablePos);
        }
        if (tableNode) {
          e.currentTarget.dataset.tableId = tableNode.attrs.id || '';
        }
      }
      dragStart?.(e);
    },
    [dragStart, index, tablePos, tableNode]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragEnd();
  }, []);

  const ariaLabel =
    orientation === 'row' ? 'Row actions' : 'Column actions';

  if (!editor?.isEditable) return null;

  const menuButton = (
    <Box
      component="button"
      className={`tiptap-table-handle-menu ${isDragging ? 'is-dragging' : ''} ${orientation}`}
      draggable={true}
      aria-label={ariaLabel}
      aria-haspopup="menu"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sx={{
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--mui-palette-background-paper3)',
        borderRadius: 'var(--mui-shape-borderRadius)',
        cursor: isDragging ? 'grabbing' : 'pointer',
        padding: 0,
        ...(orientation === 'row'
          ? {
            width: '0.75rem',
            height: '0.75rem',
          }
          : {
            width: '100%',
            height: '0.75rem',
          }),
        transition: 'background-color 0.2s ease-in-out',
        '&.is-dragging': {
          backgroundColor: 'var(--mui-palette-primary-main)',
          '& .MuiSvgIcon-root': {
            color: 'var(--mui-palette-common-white)',
          },
        },
        '&:hover': {
          backgroundColor: 'var(--mui-palette-primary-main)',
          '& .MuiSvgIcon-root': {
            color: 'var(--mui-palette-common-white)',
          },
        },
      }}
    >
      <MoreLineIcon
        sx={{
          width: '1rem',
          height: '1rem',
          flexShrink: 0,
          ...(orientation === 'row' && {
            transform: 'rotate(90deg)',
          }),
        }}
      />
    </Box>
  );

  return (
    <Menu
      width={216}
      context={menuButton}
      list={menuList}
      anchorOrigin={{
        vertical: orientation === 'row' ? 'top' : 'bottom',
        horizontal: orientation === 'row' ? 'right' : 'left',
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
};
