import React from 'react';
import {
  AlignBottomIcon,
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignTopIcon,
  BrushLineIcon,
  FontSizeIcon,
} from '../../components/Icons';
import { MenuItem } from '../../types';
import { Theme } from '@mui/material';
import { CurrentNodeInfo, CurrentState } from './types';
import {
  buildThemeTextBgColorItems,
  buildThemeTextColorItems,
  createShortcutText,
  createSectionLabel,
  withNodeTextSelection,
} from './menu-shared';

const buildColorActionItems = (current: CurrentState, theme: Theme): MenuItem[] => ([
  ...buildThemeTextColorItems(current, theme),
  ...buildThemeTextBgColorItems(current, theme),
]);

const buildFontSizeActionItems = (current: CurrentState): MenuItem[] => (
  [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60].map((size) => ({
    label: size,
    key: `${size}px`,
    textSx: { textAlign: 'center' as const },
    onClick: () => {
      withNodeTextSelection(current, (from, to) => {
        current.editor.chain().setTextSelection({ from, to }).setFontSize(`${size}px`).run();
      });
    },
  }))
);

const buildAlignActionItems = (current: CurrentState): MenuItem[] => ([
  {
    customLabel: createSectionLabel('水平对齐方式'),
    key: 'align-horizontal',
  },
  {
    label: '左侧对齐',
    extra: createShortcutText(['ctrl', 'shift', 'L']),
    key: 'align-horizontal-left',
    icon: <AlignLeftIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => withNodeTextSelection(current, (from, to) => {
      current.editor.chain().setTextSelection({ from, to }).toggleTextAlign('left').run();
    }),
  },
  {
    label: '居中对齐',
    extra: createShortcutText(['ctrl', 'shift', 'E']),
    key: 'align-horizontal-center',
    icon: <AlignCenterIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => withNodeTextSelection(current, (from, to) => {
      current.editor.chain().setTextSelection({ from, to }).toggleTextAlign('center').run();
    }),
  },
  {
    label: '右侧对齐',
    extra: createShortcutText(['ctrl', 'shift', 'R']),
    key: 'align-horizontal-right',
    icon: <AlignRightIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => withNodeTextSelection(current, (from, to) => {
      current.editor.chain().setTextSelection({ from, to }).toggleTextAlign('right').run();
    }),
  },
  {
    label: '两端对齐',
    extra: createShortcutText(['ctrl', 'shift', 'J']),
    key: 'align-horizontal-justify',
    icon: <AlignJustifyIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => withNodeTextSelection(current, (from, to) => {
      current.editor.chain().setTextSelection({ from, to }).toggleTextAlign('justify').run();
    }),
  },
  {
    customLabel: createSectionLabel('垂直对齐方式'),
    key: 'align-vertical',
  },
  {
    label: '顶部对齐',
    extra: createShortcutText(['ctrl', 'alt', 'T']),
    key: 'align-vertical-top',
    icon: <AlignTopIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => withNodeTextSelection(current, (from, to) => {
      current.editor.chain().setTextSelection({ from, to }).toggleVerticalAlign('top').run();
    }),
  },
  {
    label: '居中对齐',
    extra: createShortcutText(['ctrl', 'alt', 'M']),
    key: 'align-vertical-center',
    icon: <AlignCenterIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => withNodeTextSelection(current, (from, to) => {
      current.editor.chain().setTextSelection({ from, to }).toggleVerticalAlign('middle').run();
    }),
  },
  {
    label: '底部对齐',
    extra: createShortcutText(['ctrl', 'alt', 'B']),
    key: 'align-vertical-bottom',
    icon: <AlignBottomIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => withNodeTextSelection(current, (from, to) => {
      current.editor.chain().setTextSelection({ from, to }).toggleVerticalAlign('bottom').run();
    }),
  },
]);

export const buildStyleActions = ({
  current,
  currentNode,
  theme,
}: {
  current: CurrentState;
  currentNode: CurrentNodeInfo;
  theme: Theme;
}): MenuItem[] => ([
  ...(currentNode?.color ? [{
    key: 'color',
    label: '颜色',
    maxHeight: 400,
    width: 160,
    icon: <BrushLineIcon sx={{ fontSize: '1rem' }} />,
    children: buildColorActionItems(current, theme),
  }] : []),
  ...(currentNode?.fontSize ? [{
    key: 'fontSize',
    label: '字号',
    icon: <FontSizeIcon sx={{ fontSize: '1rem' }} />,
    width: 100,
    minWidth: 100,
    maxHeight: 200,
    children: buildFontSizeActionItems(current),
  }] : []),
  ...(currentNode?.align ? [{
    key: 'align',
    label: '对齐方式',
    icon: <AlignLeftIcon sx={{ fontSize: '1rem' }} />,
    children: buildAlignActionItems(current),
  }] : []),
]);
