import { MenuItem } from '../../../types';
import { getShortcutKeyText } from '../../../utils';
import { Typography } from '@mui/material';
import { Editor } from '@tiptap/react';
import React from 'react';
import {
  AttachmentLineIcon,
  BilibiliLineIcon,
  CheckboxCircleFillIcon,
  CloseCircleFillIcon,
  CodeBoxLineIcon,
  CodeLineIcon,
  CodeSSlashLineIcon,
  DoubleQuotesLIcon,
  EmotionLineIcon,
  ErrorWarningFillIcon,
  FlipGridIcon,
  FlowChartIcon,
  FormulaIcon,
  FunctionsIcon,
  ImageLineIcon,
  Information2FillIcon,
  Information2LineIcon,
  MenuFold2FillIcon,
  MovieLineIcon,
  Music2LineIcon,
  SeparatorIcon,
  SketchingIcon,
  SquareRootIcon,
  Table2Icon,
  UserSmileFillIcon,
  WindowFillIcon,
} from '../../Icons';
import TableSizePicker from '../TableSizePicker';

const sectionLabel = (label: string) => (
  <Typography sx={{ px: 1, pt: 1, fontSize: '12px', color: 'text.disabled' }}>
    {label}
  </Typography>
);

const shortcutLabel = (keys: string[]) => (
  <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>
    {getShortcutKeyText(keys, '+')}
  </Typography>
);

const buildAlertChildren = (editor: Editor): MenuItem[] => ([
  {
    label: '信息 Info',
    key: 'info',
    icon: <Information2FillIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />,
    onClick: () => {
      editor.chain().focus().setAlert({ type: 'icon', variant: 'info' }).run();
    },
  },
  {
    label: '警告 Warning',
    key: 'warning',
    icon: <ErrorWarningFillIcon sx={{ fontSize: '1rem', color: 'warning.main' }} />,
    onClick: () => {
      editor.chain().focus().setAlert({ type: 'icon', variant: 'warning' }).run();
    },
  },
  {
    label: '错误 Error',
    key: 'error',
    icon: <CloseCircleFillIcon sx={{ fontSize: '1rem', color: 'error.main' }} />,
    onClick: () => {
      editor.chain().focus().setAlert({ type: 'icon', variant: 'error' }).run();
    },
  },
  {
    label: '成功 Success',
    key: 'success',
    icon: <CheckboxCircleFillIcon sx={{ fontSize: '1rem', color: 'success.main' }} />,
    onClick: () => {
      editor.chain().focus().setAlert({ type: 'icon', variant: 'success' }).run();
    },
  },
  {
    label: '默认 Default',
    key: 'default',
    icon: <UserSmileFillIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />,
    onClick: () => {
      editor.chain().focus().setAlert({ type: 'icon', variant: 'default' }).run();
    },
  },
]);

const buildCodeChildren = (editor: Editor): MenuItem[] => ([
  {
    label: '行内代码',
    key: 'inlineCode',
    icon: <CodeLineIcon sx={{ fontSize: '1rem' }} />,
    extra: shortcutLabel(['ctrl', 'E']),
    onClick: () => editor.chain().focus().toggleCode().run(),
  },
  {
    label: '代码块',
    key: 'codeBlock',
    icon: <CodeBoxLineIcon sx={{ fontSize: '1rem' }} />,
    extra: shortcutLabel(['ctrl', 'alt', 'C']),
    onClick: () => editor.chain().focus().toggleCodeBlock().run(),
  },
]);

const buildMathChildren = (editor: Editor): MenuItem[] => ([
  {
    label: '行内数学公式',
    key: 'inline-math',
    icon: <SquareRootIcon sx={{ fontSize: '1rem' }} />,
    extra: shortcutLabel(['ctrl', '6']),
    onClick: () => {
      editor.commands.setInlineMath({ latex: '' });
    },
  },
  {
    label: '块级数学公式',
    key: 'block-math',
    icon: <FunctionsIcon sx={{ fontSize: '1rem' }} />,
    extra: shortcutLabel(['ctrl', '7']),
    onClick: () => {
      editor.commands.setBlockMath({ latex: '' });
    },
  },
]);

const buildTableChildren = (editor: Editor): MenuItem[] => ([
  {
    key: 'table-size-picker',
    customLabel: (
      <TableSizePicker
        onConfirm={(cols, rows) => {
          editor.commands.insertTable({ rows, cols, withHeaderRow: false });
        }}
      />
    ),
  },
]);

export const buildInsertMenuList = (editor: Editor): MenuItem[] => ([
  {
    customLabel: sectionLabel('通用'),
    key: 'current-node',
  },
  {
    label: '表情',
    key: 'emotion',
    icon: <EmotionLineIcon sx={{ fontSize: '1rem' }} />,
    extra: <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>:</Typography>,
    onClick: () => {
      const pos = editor.state.selection.from;
      editor.chain().insertContentAt(pos, ' : ').focus(pos + 2).run();
    },
  },
  {
    label: '图片',
    key: 'image',
    icon: <ImageLineIcon sx={{ fontSize: '1rem' }} />,
    extra: shortcutLabel(['ctrl', '2']),
    onClick: () => editor.commands.setImage({ src: '', width: 760 }),
  },
  {
    label: '视频',
    key: 'video',
    extra: shortcutLabel(['ctrl', '3']),
    icon: <MovieLineIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.commands.setVideo({ src: '', width: 760, controls: true, autoplay: false }),
  },
  {
    label: '音频',
    key: 'audio',
    extra: shortcutLabel(['ctrl', '4']),
    icon: <Music2LineIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.commands.setAudio({ src: '', controls: true, autoplay: false }),
  },
  {
    label: '附件',
    key: 'attachment',
    extra: shortcutLabel(['ctrl', '5']),
    icon: <AttachmentLineIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.commands.setInlineAttachment({ url: '', title: '', size: '0' }),
  },
  {
    customLabel: sectionLabel('模块'),
    key: 'style',
  },
  {
    label: '引用',
    key: 'blockquote',
    icon: <DoubleQuotesLIcon sx={{ fontSize: '1rem' }} />,
    extra: shortcutLabel(['ctrl', 'shift', 'B']),
    onClick: () => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    label: '分栏',
    key: 'flipGrid',
    icon: <FlipGridIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.chain().focus().setFlipGrid().run(),
  },
  {
    label: '表格',
    key: 'table',
    icon: <Table2Icon sx={{ fontSize: '1rem' }} />,
    extra: shortcutLabel(['ctrl', '9']),
    children: buildTableChildren(editor),
  },
  {
    label: '警告块',
    key: 'highlight',
    icon: <Information2LineIcon sx={{ fontSize: '1rem' }} />,
    children: buildAlertChildren(editor),
  },
  {
    label: '折叠面板',
    key: 'details',
    icon: <MenuFold2FillIcon sx={{ fontSize: '1rem' }} />,
    extra: shortcutLabel(['ctrl', '8']),
    onClick: () => editor.chain().focus().setDetails().run(),
  },
  {
    label: '分割线',
    key: 'separator',
    icon: <SeparatorIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    customLabel: sectionLabel('专业'),
    key: 'programmer',
  },
  {
    label: 'Mermaid 流程图',
    key: 'flow',
    icon: <FlowChartIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.commands.setFlow({}),
  },
  {
    label: 'Excalidraw 绘图',
    key: 'excalidraw',
    icon: <SketchingIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.commands.setExcalidraw(),
  },
  {
    label: '代码',
    key: 'code',
    icon: <CodeSSlashLineIcon sx={{ fontSize: '1rem' }} />,
    children: buildCodeChildren(editor),
  },
  {
    label: '数学公式',
    key: 'math',
    icon: <FormulaIcon sx={{ fontSize: '1rem' }} />,
    children: buildMathChildren(editor),
  },
  {
    customLabel: sectionLabel('其他'),
    key: 'other',
  },
  {
    label: 'Bilibili 视频',
    key: 'bilibili',
    icon: <BilibiliLineIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.commands.setIframe({ src: '', width: '100%', height: 400, type: 'bilibili' }),
  },
  {
    label: 'Iframe 链接',
    key: 'iframe',
    icon: <WindowFillIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.commands.setIframe({ src: '', width: '100%', height: 400, type: 'iframe' }),
  },
]);
