import React from 'react';
import {
  AttachmentLineIcon,
  BoldIcon,
  CheckboxCircleFillIcon,
  CloseCircleFillIcon,
  CodeBoxLineIcon,
  CodeLineIcon,
  CodeSSlashLineIcon,
  DoubleQuotesLIcon,
  ErrorWarningFillIcon,
  FlowChartIcon,
  Folder2LineIcon,
  FormulaIcon,
  FunctionsIcon,
  H1Icon,
  H2Icon,
  H3Icon,
  H4Icon,
  H5Icon,
  H6Icon,
  ImageLineIcon,
  Information2FillIcon,
  Information2LineIcon,
  ItalicIcon,
  LinkIcon,
  ListCheck3Icon,
  ListOrdered2Icon,
  ListUnorderedIcon,
  MarkPenLineIcon,
  MenuFold2FillIcon,
  MovieLineIcon,
  Music2LineIcon,
  SeparatorIcon,
  SquareRootIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  Table2Icon,
  UnderlineIcon,
  UserSmileFillIcon,
} from '../../components/Icons';
import { Typography } from '@mui/material';
import TableSizePicker from '../../components/Toolbar/TableSizePicker';

interface HeadingActionParams {
  onInsertHeading: (level: 1 | 2 | 3 | 4 | 5 | 6) => void;
}

interface ToolbarActionParams {
  isExpend?: boolean;
  onInsertInline: (options: {
    single?: string;
    left?: string;
    right?: string;
    position?: number;
    row?: number;
  }) => void;
  onInsertBlock: (options: {
    text: string;
    position?: number;
    row?: number;
    wrap?: boolean;
  }) => void;
}

interface InsertMenuParams extends ToolbarActionParams {
  onUploadClick: (type: 'image' | 'video' | 'audio' | 'attachment') => void;
}

const buildMarkdownTable = (cols: number, rows: number) => {
  const headerRow = `| ${Array.from({ length: cols }).map(() => '').join(' | ')} |\n`;
  const separatorRow = `| ${Array.from({ length: cols }).map(() => '---').join(' | ')} |\n`;
  const dataRows = Array.from({ length: rows }).map(() =>
    `| ${Array.from({ length: cols }).map(() => '').join(' | ')} |\n`
  ).join('');

  return `${headerRow}${separatorRow}${dataRows}`;
};

export const buildHeadingOptions = ({ onInsertHeading }: HeadingActionParams) => ([
  { id: '1', icon: <H1Icon sx={{ fontSize: '1rem' }} />, label: '一级标题', onClick: () => onInsertHeading(1) },
  { id: '2', icon: <H2Icon sx={{ fontSize: '1rem' }} />, label: '二级标题', onClick: () => onInsertHeading(2) },
  { id: '3', icon: <H3Icon sx={{ fontSize: '1rem' }} />, label: '三级标题', onClick: () => onInsertHeading(3) },
  { id: '4', icon: <H4Icon sx={{ fontSize: '1rem' }} />, label: '四级标题', onClick: () => onInsertHeading(4) },
  { id: '5', icon: <H5Icon sx={{ fontSize: '1rem' }} />, label: '五级标题', onClick: () => onInsertHeading(5) },
  { id: '6', icon: <H6Icon sx={{ fontSize: '1rem' }} />, label: '六级标题', onClick: () => onInsertHeading(6) },
]);

export const buildToolList = ({
  isExpend,
  onInsertInline,
  onInsertBlock,
}: ToolbarActionParams) => ([
  { id: 'bold', icon: <BoldIcon sx={{ fontSize: '1rem' }} />, label: '加粗', onClick: () => onInsertInline({ single: '**' }) },
  { id: 'italic', icon: <ItalicIcon sx={{ fontSize: '1rem' }} />, label: '斜体', onClick: () => onInsertInline({ single: '*' }) },
  { id: 'strikethrough', icon: <StrikethroughIcon sx={{ fontSize: '1rem' }} />, label: '删除线', onClick: () => onInsertInline({ single: '~~' }) },
  { id: 'underline', icon: <UnderlineIcon sx={{ fontSize: '1rem' }} />, label: '下划线', onClick: () => onInsertInline({ single: '++' }) },
  { id: 'highlight', icon: <MarkPenLineIcon sx={{ fontSize: '1rem' }} />, label: '高亮', onClick: () => onInsertInline({ single: '==' }) },
  { id: 'superscript', icon: <SuperscriptIcon sx={{ fontSize: '1rem' }} />, label: '上标', onClick: () => onInsertInline({ single: '^' }) },
  { id: 'subscript', icon: <SubscriptIcon sx={{ fontSize: '1rem' }} />, label: '下标', onClick: () => onInsertInline({ single: '~' }) },
  { id: 'divider-1' },
  { id: 'bullet-list', icon: <ListUnorderedIcon sx={{ fontSize: '1rem' }} />, label: '无序列表', onClick: () => onInsertBlock({ text: '- ', position: 2 }) },
  { id: 'ordered-list', icon: <ListOrdered2Icon sx={{ fontSize: '1rem' }} />, label: '有序列表', onClick: () => onInsertBlock({ text: '1. ', position: 3 }) },
  { id: 'task-list', icon: <ListCheck3Icon sx={{ fontSize: '1rem' }} />, label: '任务列表', onClick: () => onInsertBlock({ text: '- [ ] ', position: 6 }) },
  ...(isExpend ? [
    { id: 'divider-2' },
    { id: 'separator', icon: <SeparatorIcon sx={{ fontSize: '1rem' }} />, label: '分割线', onClick: () => onInsertBlock({ text: '---\n\n', row: 2 }) },
    { id: 'blockquote', icon: <DoubleQuotesLIcon sx={{ fontSize: '1rem' }} />, label: '引用', onClick: () => onInsertBlock({ text: '> ', position: 2 }) },
    { id: 'details', icon: <MenuFold2FillIcon sx={{ fontSize: '1rem' }} />, label: '折叠面板', onClick: () => onInsertBlock({ text: ':::details\n\n:::detailsSummary\n\n:::\n\n:::detailsContent\n\n:::\n\n:::\n', row: 3, wrap: true }) },
    { id: 'alert', icon: <Information2LineIcon sx={{ fontSize: '1rem' }} />, label: '警告块', onClick: () => onInsertBlock({ text: ':::alert {variant="info"}\n\n:::', row: 1, wrap: true }) },
    { id: 'inline-math', icon: <SquareRootIcon sx={{ fontSize: '1rem' }} />, label: '行内数学公式', onClick: () => onInsertInline({ single: '$' }) },
    { id: 'block-math', icon: <FunctionsIcon sx={{ fontSize: '1rem' }} />, label: '块级数学公式', onClick: () => onInsertBlock({ text: '$$\n\n$$', row: 1, wrap: true }) },
    { id: 'code', icon: <CodeLineIcon sx={{ fontSize: '1rem' }} />, label: '代码', onClick: () => onInsertInline({ single: '`' }) },
    { id: 'codeBlock', icon: <CodeBoxLineIcon sx={{ fontSize: '1rem' }} />, label: '代码块', onClick: () => onInsertBlock({ text: '```\n\n```', row: 1, wrap: true }) },
  ] : []),
  { id: 'divider-3' },
  { id: 'link', icon: <LinkIcon sx={{ fontSize: '1rem' }} />, label: '链接', onClick: () => onInsertInline({ left: '[', right: ']()' }) },
  { id: 'image', icon: <ImageLineIcon sx={{ fontSize: '1rem' }} />, label: '图片', onClick: () => onInsertInline({ left: '![', right: ']()' }) },
]);

export const buildInsertMenuList = ({
  onInsertInline,
  onInsertBlock,
  onUploadClick,
}: InsertMenuParams) => ([
  {
    customLabel: <Typography sx={{ px: 1, pt: 2, fontSize: '12px', color: 'text.disabled' }}>通用</Typography>,
    key: 'current-node',
  },
  {
    label: '表格',
    key: 'table',
    icon: <Table2Icon sx={{ fontSize: '1rem' }} />,
    children: [{
      key: 'table-size-picker',
      customLabel: <TableSizePicker
        onConfirm={(cols, rows) => {
          onInsertBlock({ text: buildMarkdownTable(cols, rows), position: 1, wrap: true });
        }}
      />,
    }],
  },
  {
    label: '上传文件',
    key: 'upload-file',
    icon: <Folder2LineIcon sx={{ fontSize: '1rem' }} />,
    children: [
      { label: '上传图片', key: 'upload-image', icon: <ImageLineIcon sx={{ fontSize: '1rem' }} />, onClick: () => onUploadClick('image') },
      { label: '上传视频', key: 'upload-video', icon: <MovieLineIcon sx={{ fontSize: '1rem' }} />, onClick: () => onUploadClick('video') },
      { label: '上传音频', key: 'upload-audio', icon: <Music2LineIcon sx={{ fontSize: '1rem' }} />, onClick: () => onUploadClick('audio') },
      { label: '上传附件', key: 'upload-attachment', icon: <AttachmentLineIcon sx={{ fontSize: '1rem' }} />, onClick: () => onUploadClick('attachment') },
    ],
  },
  {
    customLabel: <Typography sx={{ px: 1, pt: 2, fontSize: '12px', color: 'text.disabled' }}>样式布局</Typography>,
    key: 'style',
  },
  { label: '分割线', key: 'separator', icon: <SeparatorIcon sx={{ fontSize: '1rem' }} />, onClick: () => onInsertBlock({ text: '---\n\n', row: 2 }) },
  { label: '引用', key: 'blockquote', icon: <DoubleQuotesLIcon sx={{ fontSize: '1rem' }} />, onClick: () => onInsertBlock({ text: '> ', position: 2 }) },
  { label: '折叠面板', key: 'details', icon: <MenuFold2FillIcon sx={{ fontSize: '1rem' }} />, onClick: () => onInsertBlock({ text: ':::details\n\n:::detailsSummary\n\n:::\n\n:::detailsContent\n\n:::\n\n:::\n', row: 3, wrap: true }) },
  {
    label: '警告块',
    key: 'highlight',
    icon: <Information2LineIcon sx={{ fontSize: '1rem' }} />,
    children: [
      { label: '信息 Info', key: 'info', icon: <Information2FillIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />, onClick: () => onInsertBlock({ text: ':::alert {variant="info"}\n\n:::', row: 1, wrap: true }) },
      { label: '警告 Warning', key: 'warning', icon: <ErrorWarningFillIcon sx={{ fontSize: '1rem', color: 'warning.main' }} />, onClick: () => onInsertBlock({ text: ':::alert {variant="warning"}\n\n:::', row: 1, wrap: true }) },
      { label: '错误 Error', key: 'error', icon: <CloseCircleFillIcon sx={{ fontSize: '1rem', color: 'error.main' }} />, onClick: () => onInsertBlock({ text: ':::alert {variant="error"}\n\n:::', row: 1, wrap: true }) },
      { label: '成功 Success', key: 'success', icon: <CheckboxCircleFillIcon sx={{ fontSize: '1rem', color: 'success.main' }} />, onClick: () => onInsertBlock({ text: ':::alert {variant="success"}\n\n:::', row: 1, wrap: true }) },
      { label: '默认 Default', key: 'default', icon: <UserSmileFillIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />, onClick: () => onInsertBlock({ text: ':::alert {variant="default"}\n\n:::', row: 1, wrap: true }) },
    ],
  },
  {
    customLabel: <Typography sx={{ px: 1, pt: 2, fontSize: '12px', color: 'text.disabled' }}>专业</Typography>,
    key: 'professional',
  },
  {
    label: '代码',
    key: 'code',
    icon: <CodeSSlashLineIcon sx={{ fontSize: '1rem' }} />,
    children: [
      { label: '行内代码', key: 'inlineCode', icon: <CodeLineIcon sx={{ fontSize: '1rem' }} />, onClick: () => onInsertInline({ single: '`' }) },
      { label: '代码块', key: 'codeBlock', icon: <CodeBoxLineIcon sx={{ fontSize: '1rem' }} />, onClick: () => onInsertBlock({ text: '```\n\n```', row: 1, wrap: true }) },
    ],
  },
  {
    label: '数学公式',
    key: 'math',
    icon: <FormulaIcon sx={{ fontSize: '1rem' }} />,
    children: [
      { label: '行内数学公式', key: 'inline-math', icon: <SquareRootIcon sx={{ fontSize: '1rem' }} />, onClick: () => onInsertInline({ single: '$' }) },
      { label: '块级数学公式', key: 'block-math', icon: <FunctionsIcon sx={{ fontSize: '1rem' }} />, onClick: () => onInsertBlock({ text: '$$\n\n$$', row: 1, wrap: true }) },
    ],
  },
  { label: 'Mermaid 流程图', key: 'flowchart', icon: <FlowChartIcon sx={{ fontSize: '1rem' }} />, onClick: () => onInsertBlock({ text: '```mermaid\n\n```', row: 1, wrap: true }) },
]);

export const buildTableMenuList = ({
  onInsertBlock,
}: Pick<ToolbarActionParams, 'onInsertBlock'>) => ([
  {
    key: 'table-size-picker',
    customLabel: <TableSizePicker
      onConfirm={(cols, rows) => {
        onInsertBlock({ text: buildMarkdownTable(cols, rows), position: 1, wrap: true });
      }}
    />,
  },
]);
