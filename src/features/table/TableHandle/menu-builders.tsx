import {
  AlignBottomIcon,
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignTopIcon,
  BrushLineIcon,
} from '../../../components/Icons';
import { getThemeTextBgColor, getThemeTextColor } from '../../../constants/enums';
import type { MenuItem } from '../../../types';
import { Box, Divider, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { TextSelection } from '@tiptap/pm/state';
import { CellSelection, cellAround } from '@tiptap/pm/tables';
import type { Editor } from '@tiptap/react';
import React from 'react';

interface TableMenuBuilderOptions {
  editor?: Editor | null;
  beforeApply?: () => void;
}

interface TableColorMenuBuilderOptions extends TableMenuBuilderOptions {
  theme: Theme;
}

const deferTableAction = (
  editor: Editor | null | undefined,
  action: () => void,
  beforeApply?: () => void
) => {
  if (!editor) return;

  beforeApply?.();
  window.setTimeout(() => {
    if (editor.isDestroyed) return;
    action();
  }, 0);
};

const createMenuSectionLabel = (key: string, label: string): MenuItem => ({
  key,
  customLabel: (
    <Typography
      sx={{
        p: 1,
        fontSize: '0.75rem',
        color: 'text.secondary',
        fontWeight: 'bold',
      }}
    >
      {label}
    </Typography>
  ),
});

export const createTableMenuDivider = (key: string): MenuItem => ({
  key,
  customLabel: <Divider sx={{ my: 0.5 }} />,
});

const createColorIcon = (
  color: string,
  theme: Theme,
  withTransparentBorder: boolean
) => (
  <Box
    sx={{
      width: '1rem',
      height: '1rem',
      borderRadius: '50%',
      bgcolor: color,
      border: '1px solid',
      borderColor: withTransparentBorder
        ? color === theme.palette.common.white
          ? 'divider'
          : 'transparent'
        : 'divider',
    }}
  />
);

const applyTextColorToTableSelection = (
  editor: Editor | null | undefined,
  color: string,
  beforeApply?: () => void
) => {
  if (!editor) return;

  if (editor.state.storedMarks) {
    const textStyleMarkType = editor.schema.marks.textStyle;
    if (textStyleMarkType) {
      editor.view.dispatch(editor.state.tr.removeStoredMark(textStyleMarkType));
    }
  }

  deferTableAction(
    editor,
    () => {
      const { selection, doc } = editor.state;
      const textStyleMark = editor.schema.marks.textStyle;
      if (!textStyleMark) return;

      if (selection instanceof CellSelection) {
        let tr = editor.state.tr;
        let hasContent = false;

        selection.forEachCell((cellNode, cellPos) => {
          if (cellNode.content.size === 0) return;

          const from = cellPos + 1;
          const to = cellPos + cellNode.nodeSize - 1;
          if (from >= to) return;

          hasContent = true;
          const mark = textStyleMark.create({ color });
          tr = tr.addMark(from, to, mark);
        });

        if (hasContent) {
          editor.view.dispatch(tr);
          editor.commands.focus();
        }
        return;
      }

      const { $anchor } = selection;
      const cell = cellAround($anchor);
      if (cell) {
        const cellNode = doc.nodeAt(cell.pos);
        if (cellNode && cellNode.content.size > 0) {
          const from = cell.pos + 1;
          const to = cell.pos + cellNode.nodeSize - 1;
          if (from < to) {
            const $from = doc.resolve(from);
            const $to = doc.resolve(to);
            const newSelection = TextSelection.between($from, $to, 1);
            if (newSelection) {
              editor.view.dispatch(editor.state.tr.setSelection(newSelection));
            }
          }
        }
      }

      editor.chain().focus().toggleMark('textStyle', { color }).run();
    },
    beforeApply
  );
};

const applyCellAttribute = (
  editor: Editor | null | undefined,
  attribute: 'bgcolor' | 'textAlign' | 'verticalAlign',
  value: string,
  beforeApply?: () => void
) => {
  if (!editor) return;

  deferTableAction(
    editor,
    () => {
      editor.chain().focus().setCellAttribute(attribute, value).run();
    },
    beforeApply
  );
};

export const buildTableColorMenu = ({
  editor,
  theme,
  beforeApply,
}: TableColorMenuBuilderOptions): MenuItem => ({
  key: 'color',
  label: '颜色',
  icon: <BrushLineIcon sx={{ fontSize: '1rem' }} />,
  children: [
    createMenuSectionLabel('text-color', '文字颜色'),
    ...getThemeTextColor(theme).map((it) => ({
      key: `text-color-${it.value}`,
      label: it.label,
      icon: createColorIcon(it.value, theme, true),
      onClick: () => applyTextColorToTableSelection(editor, it.value, beforeApply),
    })),
    createMenuSectionLabel('background-color', '背景颜色'),
    ...getThemeTextBgColor(theme).map((it) => ({
      key: `background-color-${it.value}`,
      label: it.label,
      icon: createColorIcon(it.value, theme, false),
      onClick: () => {
        const bgColor =
          it.value === 'transparent' ||
          it.value === 'var(--mui-palette-background-paper)'
            ? 'transparent'
            : it.value;
        applyCellAttribute(editor, 'bgcolor', bgColor, beforeApply);
      },
    })),
  ],
});

export const buildTableAlignMenu = ({
  editor,
  beforeApply,
}: TableMenuBuilderOptions): MenuItem => ({
  key: 'align',
  label: '对齐方式',
  icon: <AlignLeftIcon sx={{ fontSize: '1rem' }} />,
  children: [
    createMenuSectionLabel('align-horizontal', '水平对齐方式'),
    {
      key: 'align-horizontal-left',
      label: '左侧对齐',
      icon: <AlignLeftIcon sx={{ fontSize: '1rem' }} />,
      onClick: () => applyCellAttribute(editor, 'textAlign', 'left', beforeApply),
    },
    {
      key: 'align-horizontal-center',
      label: '居中对齐',
      icon: <AlignCenterIcon sx={{ fontSize: '1rem' }} />,
      onClick: () => applyCellAttribute(editor, 'textAlign', 'center', beforeApply),
    },
    {
      key: 'align-horizontal-right',
      label: '右侧对齐',
      icon: <AlignRightIcon sx={{ fontSize: '1rem' }} />,
      onClick: () => applyCellAttribute(editor, 'textAlign', 'right', beforeApply),
    },
    {
      key: 'align-horizontal-justify',
      label: '两端对齐',
      icon: <AlignJustifyIcon sx={{ fontSize: '1rem' }} />,
      onClick: () => applyCellAttribute(editor, 'textAlign', 'justify', beforeApply),
    },
    createMenuSectionLabel('align-vertical', '垂直对齐方式'),
    {
      key: 'align-vertical-top',
      label: '顶部对齐',
      icon: <AlignTopIcon sx={{ fontSize: '1rem' }} />,
      onClick: () => applyCellAttribute(editor, 'verticalAlign', 'top', beforeApply),
    },
    {
      key: 'align-vertical-center',
      label: '居中对齐',
      icon: <AlignCenterIcon sx={{ fontSize: '1rem' }} />,
      onClick: () => applyCellAttribute(editor, 'verticalAlign', 'middle', beforeApply),
    },
    {
      key: 'align-vertical-bottom',
      label: '底部对齐',
      icon: <AlignBottomIcon sx={{ fontSize: '1rem' }} />,
      onClick: () => applyCellAttribute(editor, 'verticalAlign', 'bottom', beforeApply),
    },
  ],
});
