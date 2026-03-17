import { Box, Theme, Typography } from '@mui/material';
import React from 'react';
import { getThemeTextBgColor, getThemeTextColor, NodeTypeEnum } from '../../constants/enums';
import { MenuItem } from '../../types';
import { getShortcutKeyText } from '../../utils';
import { CurrentState } from './types';

export const GROUP_TYPES = [
  NodeTypeEnum.BulletList,
  NodeTypeEnum.OrderedList,
  NodeTypeEnum.TaskList,
  NodeTypeEnum.Blockquote,
  NodeTypeEnum.CodeBlock,
  NodeTypeEnum.Alert,
];

export const withNodeTextSelection = (
  current: CurrentState,
  callback: (from: number, to: number) => void,
) => {
  if (!current.node || current.pos === undefined) {
    return;
  }

  const innerFrom = current.pos + 1;
  const innerTo = current.pos + current.node.nodeSize - 1;

  if (innerFrom < innerTo) {
    callback(innerFrom, innerTo);
    return;
  }

  const from = current.pos;
  const to = current.pos + current.node.nodeSize;
  callback(from, to);
};

export const createSectionLabel = (label: string) => (
  <Typography sx={{ p: 1, fontSize: '0.75rem', color: 'text.secondary', fontWeight: 'bold' }}>
    {label}
  </Typography>
);

export const createShortcutText = (shortcutKey: string[]) => (
  <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>
    {getShortcutKeyText(shortcutKey, '+')}
  </Typography>
);

export const buildThemeTextColorItems = (current: CurrentState, theme: Theme): MenuItem[] => ([
  {
    customLabel: createSectionLabel('文字颜色'),
    key: 'text-color',
  },
  ...getThemeTextColor(theme).map((item) => ({
    label: item.label,
    key: item.value,
    icon: (
      <Box sx={{
        color: item.value,
        width: '1rem',
        height: '1rem',
        borderRadius: '50%',
        bgcolor: item.value,
        border: '1px solid',
        borderColor: item.value === theme.palette.common.white ? 'divider' : 'transparent',
      }} />
    ),
    onClick: () => {
      withNodeTextSelection(current, (from, to) => {
        current.editor.chain().setTextSelection({ from, to }).setColor(item.value).run();
      });
    },
  })),
]);

export const buildThemeTextBgColorItems = (current: CurrentState, theme: Theme): MenuItem[] => ([
  {
    customLabel: createSectionLabel('文字背景颜色'),
    key: 'background-color',
  },
  ...getThemeTextBgColor(theme).map((item) => ({
    label: item.label,
    key: item.value,
    icon: (
      <Box sx={{
        width: '1rem',
        height: '1rem',
        borderRadius: '50%',
        bgcolor: item.value,
        border: '1px solid',
        borderColor: 'divider',
      }} />
    ),
    onClick: () => {
      withNodeTextSelection(current, (from, to) => {
        current.editor.chain().focus().setTextSelection({ from, to }).setBackgroundColor(item.value).run();
      });
    },
  })),
]);
