import { Box, Stack } from '@mui/material';
import { Editor, useEditorState } from '@tiptap/react';
import React from 'react';
import { ToolbarItemType } from '../../types';
import { hasMarksInSelection } from '../../utils';
import {
  AiToolbarItem,
  HistoryToolbarSection,
  InsertToolbarSection,
  LayoutToolbarSection,
  MarksToolbarSection,
  ModeToggleToolbarItem,
  StructureToolbarSection,
  TypographyToolbarSection,
} from './toolbar-sections';

interface EditorToolbarProps {
  editor: Editor;
  menuInToolbarMore?: ToolbarItemType[];
  /**
   * Toolbar 模式
   * - advanced：展示全部工具
   * - simple：只展示常用工具，并尽量保持单行
   */
  mode?: 'simple' | 'advanced';
  onModeChange?: (mode: 'simple' | 'advanced') => void;
}

const EditorToolbar = ({
  editor,
  menuInToolbarMore,
  mode,
  onModeChange,
}: EditorToolbarProps) => {
  const [toolbarMode, setToolbarMode] = React.useState<'simple' | 'advanced'>(
    () => mode ?? 'advanced',
  );

  React.useEffect(() => {
    if (typeof mode !== 'undefined') {
      setToolbarMode(mode);
    }
  }, [mode]);

  const isSimpleMode = toolbarMode === 'simple';

  const handleToggleMode = React.useCallback(() => {
    const nextMode: 'simple' | 'advanced' = isSimpleMode
      ? 'advanced'
      : 'simple';
    setToolbarMode(nextMode);
    onModeChange?.(nextMode);
  }, [isSimpleMode, onModeChange]);

  const {
    isUndo,
    isRedo,
    isFormat,
    isBold,
    isItalic,
    isStrike,
    isUnderline,
    isSuperscript,
    isSubscript,
    isLink,
    isAiWriting,
    isHighlight,
    isCodeBlock,
    isTooltip,
  } = useEditorState({
    editor,
    selector: (ctx) => ({
      isUndo: ctx.editor.can().chain().undo().run() ?? false,
      isRedo: ctx.editor.can().chain().redo().run() ?? false,
      isFormat: hasMarksInSelection(ctx.editor.state),
      isBold: ctx.editor.isActive('bold'),
      isItalic: ctx.editor.isActive('italic'),
      isStrike: ctx.editor.isActive('strike'),
      isUnderline: ctx.editor.isActive('underline'),
      isSuperscript: ctx.editor.isActive('superscript'),
      isSubscript: ctx.editor.isActive('subscript'),
      isLink: ctx.editor.isActive('link'),
      isHighlight: ctx.editor.isActive('highlight'),
      isAiWriting: !!ctx.editor.storage?.aiWriting?.enabled,
      isCodeBlock: ctx.editor.isActive('codeBlock'),
      isTooltip: ctx.editor.isActive('tooltip'),
    }),
  });

  return (
    <Box className="editor-toolbar">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={isSimpleMode ? 'flex-start' : 'center'}
        flexWrap={isSimpleMode ? 'nowrap' : 'wrap'}
        sx={{
          minHeight: '44px',
          overflowX: isSimpleMode ? 'auto' : 'visible',
          columnGap: '1px',
          '.MuiSelect-root': {
            minWidth: '36px',
            bgcolor: 'background.paper',
            '.MuiSelect-select': {
              p: '0 !important',
            },
            input: {
              display: 'none',
            },
            '&:hover': {
              bgcolor: 'background.paper2',
            },
            '&.tool-active': {
              bgcolor: 'background.paper2',
              color: 'primary.main',
              button: {
                color: 'primary.main',
              },
            },
            '.MuiOutlinedInput-notchedOutline': {
              borderWidth: '0px !important',
            },
          },
        }}
      >
        {!isSimpleMode && <AiToolbarItem editor={editor} isAiWriting={isAiWriting} />}
        <InsertToolbarSection editor={editor} isSimpleMode={isSimpleMode} />
        <HistoryToolbarSection editor={editor} flags={{
          isUndo,
          isRedo,
          isFormat,
          isBold,
          isItalic,
          isStrike,
          isUnderline,
          isSuperscript,
          isSubscript,
          isLink,
          isAiWriting,
          isHighlight,
          isCodeBlock,
          isTooltip,
        }} />
        <TypographyToolbarSection editor={editor} isSimpleMode={isSimpleMode} />
        <MarksToolbarSection editor={editor} isSimpleMode={isSimpleMode} flags={{
          isUndo,
          isRedo,
          isFormat,
          isBold,
          isItalic,
          isStrike,
          isUnderline,
          isSuperscript,
          isSubscript,
          isLink,
          isAiWriting,
          isHighlight,
          isCodeBlock,
          isTooltip,
        }} />
        <StructureToolbarSection editor={editor} isSimpleMode={isSimpleMode} flags={{
          isUndo,
          isRedo,
          isFormat,
          isBold,
          isItalic,
          isStrike,
          isUnderline,
          isSuperscript,
          isSubscript,
          isLink,
          isAiWriting,
          isHighlight,
          isCodeBlock,
          isTooltip,
        }} />
        <LayoutToolbarSection
          editor={editor}
          isSimpleMode={isSimpleMode}
          menuInToolbarMore={menuInToolbarMore}
        />
        {mode === 'simple' && (
          <ModeToggleToolbarItem isSimpleMode={isSimpleMode} onToggle={handleToggleMode} />
        )}
      </Stack>
    </Box>
  );
};

export default EditorToolbar;
