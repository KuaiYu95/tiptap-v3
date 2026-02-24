import { PopoverOrigin, SxProps, Theme } from '@mui/material';
import { Editor, Extension } from '@tiptap/core';
import { TableOfContentsOptions } from '@tiptap/extension-table-of-contents';
import { YoutubeOptions } from '@tiptap/extension-youtube';
import { UseEditorOptions } from '@tiptap/react';
import { MermaidConfig } from 'mermaid';

export type { Editor } from '@tiptap/react';

export interface MenuItem {
  label?: React.ReactNode;
  customLabel?: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  selected?: boolean;
  attrs?: Record<string, unknown>;
  children?: MenuItem[];
  textSx?: SxProps<Theme>;
  key: number | string;
  width?: number;
  minWidth?: number;
  maxHeight?: number;
  onClick?: () => void;
}

export interface MenuProps {
  id?: string;
  width?: React.CSSProperties['width'];
  maxHeight?: React.CSSProperties['maxHeight'];
  arrowIcon?: React.ReactNode;
  list: MenuItem[];
  header?: React.ReactNode;
  context?: React.ReactElement<{ onClick?: any; 'aria-describedby'?: any }>;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
  childrenProps?: {
    anchorOrigin?: PopoverOrigin;
    transformOrigin?: PopoverOrigin;
  };
  zIndex?: number;
  onOpen?: () => void;
  onClose?: () => void;
}

export type ToolbarItemType = {
  id: string;
  icon?: React.ReactNode;
  label?: string;
  tip?: string;
  shortcutKey?: string[];
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export type UploadFunction = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
) => Promise<string>

/** 图片 URL 上传：将图片链接交由后端处理并返回新 URL，可随时通过 abortSignal 中止请求 */
export type UploadImgUrlFunction = (
  url: string,
  abortSignal?: AbortSignal
) => Promise<string>

export type TipType = 'error' | 'success' | 'info' | 'warning'

export type OnTipFunction = (type: TipType, tip: string) => void

export type EditorProps = {
  editor: Editor;
  menuInDragHandle?: MenuItem[]
  menuInBubbleMenu?: MenuItem[]
  height?: number | string;
  onTip?: OnTipFunction
}

export type TocItem = {
  id: string;
  isActive: boolean;
  isScrolledOver: boolean;
  itemIndex: number;
  level: number;
  originalLevel: number;
  pos: number;
  textContent: string;
}
export type TocList = TocItem[]

export type ValidateUrlFunction = (url: string, type: 'image' | 'video' | 'audio' | 'iframe') => Promise<string> | string

export type EditorFnProps = {
  /**
   * 错误处理
   */
  onError?: (error: Error) => void
  /**
   * 上传处理
   */
  onUpload?: UploadFunction
  /**
   * 图片链接上传：当为图片 URL 时，直接交由后端处理而非前端下载再上传
   */
  onUploadImgUrl?: UploadImgUrlFunction
  /**
   * 目录更新
   */
  onTocUpdate?: (toc: TocList) => void
  /**
   * AI 写作建议
   */
  onAiWritingGetSuggestion?: ({ prefix, suffix }: { prefix: string, suffix: string }) => Promise<string>
  /**
   * 验证 URL
   */
  onValidateUrl?: ValidateUrlFunction
}

export type MentionItems = string[]
export type MentionExtensionProps = {
  mentionItems?: MentionItems;
  onMentionFilter?: ({ query }: { query: string }) => Promise<MentionItems>;
}

export type NodeOrMetaOrSuggestionOrExtensionOptions = {
  mermaidOptions?: Partial<MermaidConfig>
  youtubeOptions?: Partial<YoutubeOptions>
  tableOfContentsOptions?: Partial<TableOfContentsOptions>
}

export type BaseExtensionOptions = {
  /**
   * 字数限制
   */
  limit?: number | null
  /**
   * 排除的扩展
   */
  exclude?: string[]
  /**
   * 扩展
   * @default []
   */
  extensions?: Extension[]
  /**
   * 是否可编辑
   * @default true
   */
  editable: boolean
  /**
   * 内容类型
   * @default 'html'
   * @description 支持 'html' 和 'markdown' 和 'json'
   */
  contentType?: UseEditorOptions['contentType']
  /**
   * 占位符
   */
  placeholder?: string
  /**
   * 静态资源基础路径
   */
  baseUrl?: string
}

export type ExtensionRelativeProps =
  MentionExtensionProps &
  NodeOrMetaOrSuggestionOrExtensionOptions &
  EditorFnProps &
  BaseExtensionOptions

export type UseTiptapProps = {
  onSave?: (editor: Editor) => void
} & ExtensionRelativeProps

export type GetExtensionsProps = ExtensionRelativeProps

export type UseTiptapReturn = {
  editor: Editor
  setContent: (value: string, type?: UseEditorOptions['contentType']) => void
  getContent: () => string
  getMarkdown: () => string
  getText: () => string
  getHTML: () => string
  getJSON: () => any
}

export interface SlashCommandItem {
  title: string
  icon: React.ReactNode
  command: (props: { editor: Editor; range: { from: number; to: number } }) => void
  attrs?: Record<string, unknown>
  shortcutKey?: string[]
  children?: SlashCommandItem[]
}

export interface SlashCommandsListProps {
  items: SlashCommandItem[]
  command: (item: SlashCommandItem) => void
  editor: Editor
}

export interface SlashCommandsListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}
