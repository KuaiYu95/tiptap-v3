import React from 'react';
import { Editor } from '@tiptap/react';
import {
  ArrowGoBackLineIcon,
  ArrowGoForwardLineIcon,
  BoldIcon,
  CodeBoxLineIcon,
  EraserLineIcon,
  ItalicIcon,
  LinkIcon,
  MarkPenLineIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  TooltipLineIcon,
  UnderlineIcon,
} from '../../components/Icons';
import { ToolbarItem } from '../../components/Toolbar';
import { getLinkAttributesWithSelectedText } from '../../utils';

export interface EditorToolbarFlags {
  isUndo: boolean;
  isRedo: boolean;
  isFormat: boolean;
  isBold: boolean;
  isItalic: boolean;
  isStrike: boolean;
  isUnderline: boolean;
  isSuperscript: boolean;
  isSubscript: boolean;
  isLink: boolean;
  isAiWriting: boolean;
  isHighlight: boolean;
  isCodeBlock: boolean;
  isTooltip: boolean;
}

export interface ToolbarActionConfig {
  id: string;
  tip: string;
  icon: React.ReactNode;
  shortcutKey?: string[];
  className?: string;
  disabled?: boolean;
  onClick: () => void;
}

export const renderToolbarActions = (actions: ToolbarActionConfig[]) => (
  <>
    {actions.map((action) => (
      <ToolbarItem
        key={action.id}
        tip={action.tip}
        shortcutKey={action.shortcutKey}
        icon={action.icon}
        onClick={action.onClick}
        className={action.className}
        disabled={action.disabled}
      />
    ))}
  </>
);

export const buildHistoryActions = (
  editor: Editor,
  flags: Pick<EditorToolbarFlags, 'isUndo' | 'isRedo' | 'isFormat'>,
): ToolbarActionConfig[] => [
  {
    id: 'undo',
    tip: '撤销',
    shortcutKey: ['ctrl', 'Z'],
    icon: <ArrowGoBackLineIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.chain().focus().undo().run(),
    disabled: !flags.isUndo,
  },
  {
    id: 'redo',
    tip: '重做',
    shortcutKey: ['ctrl', 'Y'],
    icon: <ArrowGoForwardLineIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.chain().focus().redo().run(),
    disabled: !flags.isRedo,
  },
  {
    id: 'clear-format',
    tip: '清除格式',
    icon: <EraserLineIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.chain().focus().unsetAllMarks().run(),
    disabled: !flags.isFormat,
  },
];

export const buildBaseMarkActions = (
  editor: Editor,
  flags: Pick<EditorToolbarFlags, 'isBold' | 'isItalic'>,
): ToolbarActionConfig[] => [
  {
    id: 'bold',
    tip: '加粗',
    shortcutKey: ['ctrl', 'B'],
    icon: <BoldIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.chain().focus().toggleBold().run(),
    className: flags.isBold ? 'tool-active' : '',
  },
  {
    id: 'italic',
    tip: '斜体',
    shortcutKey: ['ctrl', 'I'],
    icon: <ItalicIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.chain().focus().toggleItalic().run(),
    className: flags.isItalic ? 'tool-active' : '',
  },
];

export const buildAdvancedMarkActions = (
  editor: Editor,
  flags: Pick<EditorToolbarFlags, 'isStrike' | 'isUnderline' | 'isHighlight' | 'isTooltip' | 'isSuperscript' | 'isSubscript'>,
): ToolbarActionConfig[] => [
  {
    id: 'strike',
    tip: '删除线',
    shortcutKey: ['ctrl', 'shift', 'S'],
    icon: <StrikethroughIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.chain().focus().toggleStrike().run(),
    className: flags.isStrike ? 'tool-active' : '',
  },
  {
    id: 'underline',
    tip: '下划线',
    shortcutKey: ['ctrl', 'U'],
    icon: <UnderlineIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.chain().focus().toggleUnderline().run(),
    className: flags.isUnderline ? 'tool-active' : '',
  },
  {
    id: 'highlight',
    tip: '高亮',
    shortcutKey: ['ctrl', 'shift', 'H'],
    icon: <MarkPenLineIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.chain().focus().toggleHighlight().run(),
    className: flags.isHighlight ? 'tool-active' : '',
  },
  {
    id: 'tooltip',
    tip: '文本提示',
    icon: <TooltipLineIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => {
      if (flags.isTooltip) {
        editor.chain().focus().unsetTooltip().run();
      } else {
        editor.chain().focus().toggleTooltip().run();
      }
    },
    className: flags.isTooltip ? 'tool-active' : '',
  },
  {
    id: 'superscript',
    tip: '上标',
    shortcutKey: ['ctrl', '.'],
    icon: <SuperscriptIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.chain().focus().toggleSuperscript().run(),
    className: flags.isSuperscript ? 'tool-active' : '',
  },
  {
    id: 'subscript',
    tip: '下标',
    shortcutKey: ['ctrl', ','],
    icon: <SubscriptIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => editor.chain().focus().toggleSubscript().run(),
    className: flags.isSubscript ? 'tool-active' : '',
  },
];

export const buildStructureAction = (
  editor: Editor,
  isSimpleMode: boolean,
  flags: Pick<EditorToolbarFlags, 'isCodeBlock' | 'isLink'>,
): ToolbarActionConfig => (
  isSimpleMode
    ? {
        id: 'code-block',
        tip: '代码块',
        shortcutKey: ['ctrl', 'alt', 'C'],
        icon: <CodeBoxLineIcon sx={{ fontSize: '1rem' }} />,
        onClick: () => editor.chain().focus().toggleCodeBlock().run(),
        className: flags.isCodeBlock ? 'tool-active' : '',
      }
    : {
        id: 'link',
        tip: '链接',
        shortcutKey: ['ctrl', '1'],
        icon: <LinkIcon sx={{ fontSize: '1rem' }} />,
        onClick: () => {
          const linkAttributes = getLinkAttributesWithSelectedText(editor);
          editor
            .chain()
            .focus()
            .setInlineLink({ href: '', ...linkAttributes })
            .run();
        },
        className: flags.isLink ? 'tool-active' : '',
      }
);
