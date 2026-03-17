import React from 'react';
import { Editor } from '@tiptap/react';
import {
  AiGenerate2Icon,
  CollapseHorizontalLine,
  ExpandHorizontalLineIcon,
} from '../../components/Icons';
import {
  EditorAlignSelect,
  EditorFontBgColor,
  EditorFontColor,
  EditorFontSize,
  EditorHeading,
  EditorInsert,
  EditorListSelect,
  EditorMore,
  EditorVerticalAlignSelect,
  ToolbarItem,
} from '../../components/Toolbar';
import { ToolbarItemType } from '../../types';
import {
  buildAdvancedMarkActions,
  buildBaseMarkActions,
  buildHistoryActions,
  buildStructureAction,
  EditorToolbarFlags,
  renderToolbarActions,
} from './toolbar-config';
import ToolbarDivider from './toolbar-divider';

interface EditorToolbarSectionProps {
  editor: Editor;
  isSimpleMode: boolean;
  flags: EditorToolbarFlags;
  menuInToolbarMore?: ToolbarItemType[];
}

interface ModeToggleToolbarItemProps {
  isSimpleMode: boolean;
  onToggle: () => void;
}

export const AiToolbarItem = ({ editor, isAiWriting }: Pick<EditorToolbarSectionProps, 'editor'> & Pick<EditorToolbarFlags, 'isAiWriting'>) => {
  if (!editor.options.extensions.find((it) => it.name === 'aiWriting')) {
    return null;
  }

  return (
    <ToolbarItem
      text="AI 伴写"
      tip="开启后按下 Tab 键采纳建议"
      icon={<AiGenerate2Icon sx={{ fontSize: '1rem' }} />}
      onClick={() => editor.chain().focus().setAiWriting(!isAiWriting).run()}
      className={isAiWriting ? 'tool-active' : ''}
    />
  );
};

export const InsertToolbarSection = ({ editor, isSimpleMode }: Pick<EditorToolbarSectionProps, 'editor' | 'isSimpleMode'>) => {
  if (isSimpleMode) {
    return null;
  }

  return (
    <>
      <EditorInsert editor={editor} />
      <ToolbarDivider />
    </>
  );
};

export const HistoryToolbarSection = ({ editor, flags }: Pick<EditorToolbarSectionProps, 'editor' | 'flags'>) => {
  const actions = buildHistoryActions(editor, flags);

  return (
    <>
      {renderToolbarActions(actions)}
      <ToolbarDivider />
    </>
  );
};

export const TypographyToolbarSection = ({ editor, isSimpleMode }: Pick<EditorToolbarSectionProps, 'editor' | 'isSimpleMode'>) => (
  <>
    <EditorHeading editor={editor} />
    {!isSimpleMode && (
      <>
        <EditorFontSize editor={editor} />
        <EditorFontColor editor={editor} />
        <EditorFontBgColor editor={editor} />
      </>
    )}
    <ToolbarDivider />
  </>
);

export const MarksToolbarSection = ({ editor, isSimpleMode, flags }: Pick<EditorToolbarSectionProps, 'editor' | 'isSimpleMode' | 'flags'>) => {
  const baseActions = buildBaseMarkActions(editor, flags);
  const advancedActions = buildAdvancedMarkActions(editor, flags);

  return (
    <>
      {renderToolbarActions(baseActions)}
      {!isSimpleMode && (
        <>
          {renderToolbarActions(advancedActions)}
          <ToolbarDivider />
        </>
      )}
    </>
  );
};

export const StructureToolbarSection = ({ editor, isSimpleMode, flags }: Pick<EditorToolbarSectionProps, 'editor' | 'isSimpleMode' | 'flags'>) => {
  const action = buildStructureAction(editor, isSimpleMode, flags);

  return (
    <>
      <EditorListSelect editor={editor} />
      {renderToolbarActions([action])}
    </>
  );
};

export const LayoutToolbarSection = ({
  editor,
  isSimpleMode,
  menuInToolbarMore,
}: Pick<EditorToolbarSectionProps, 'editor' | 'isSimpleMode' | 'menuInToolbarMore'>) => {
  if (isSimpleMode) {
    return menuInToolbarMore?.length ? <EditorMore more={menuInToolbarMore} /> : null;
  }

  return (
    <>
      <EditorAlignSelect editor={editor} />
      <EditorVerticalAlignSelect editor={editor} />
      <ToolbarDivider />
      <EditorMore more={menuInToolbarMore} />
    </>
  );
};

export const ModeToggleToolbarItem = ({ isSimpleMode, onToggle }: ModeToggleToolbarItemProps) => (
  <ToolbarItem
    tip={isSimpleMode ? '切换为复杂模式' : '切换为简单模式'}
    icon={
      isSimpleMode ? (
        <ExpandHorizontalLineIcon sx={{ fontSize: '1rem' }} />
      ) : (
        <CollapseHorizontalLine sx={{ fontSize: '1rem' }} />
      )
    }
    onClick={onToggle}
  />
);
