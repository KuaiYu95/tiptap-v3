import { CollapseIcon, ExpendIcon } from '../../components/Icons';
import { alpha, Box, Divider, IconButton, Stack, useTheme } from "@mui/material";
import { Editor } from '@tiptap/core';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import AceEditor from "react-ace";
import { MARKDOWN_EDITOR_PLACEHOLDER } from '../../constants/markdown-placeholder';
import { UploadFunction } from '../../types';
import TiptapEditor from '../../app/editor/Editor';
import EditorMarkdownToolbar from './Toolbar';
import UploadProgress from './UploadProgress';
import { useAceComposition } from './use-ace-composition';
import { DisplayMode, useDisplayMode } from './use-display-mode';
import { useMarkdownSync } from './use-markdown-sync';
import { useMarkdownTransfer } from './use-markdown-transfer';
import { useMarkdownUpload } from './use-markdown-upload';

import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/theme-github';

interface EditorMarkdownProps {
  editor: Editor;
  value?: string;
  readOnly?: boolean;
  showAutocomplete?: boolean;
  highlightActiveLine?: boolean;
  placeholder?: string;
  height: number | string;
  onUpload?: UploadFunction;
  defaultDisplayMode?: DisplayMode;
  splitMode?: boolean;
  showToolbar?: boolean;
  showLineNumbers?: boolean;
  onAceChange?: (value: string) => void;
  onTiptapChange?: (value: string) => void;
}

export interface MarkdownEditorRef {
  scrollToHeading: (headingText: string) => void;
}

const EditorMarkdown = forwardRef<MarkdownEditorRef, EditorMarkdownProps>(({
  editor,
  value,
  placeholder,
  onAceChange,
  onTiptapChange,
  height,
  onUpload,
  readOnly = false,
  splitMode = false,
  showAutocomplete = true,
  highlightActiveLine = true,
  defaultDisplayMode = 'edit',
  showToolbar = true,
  showLineNumbers = true,
}, ref) => {
  const theme = useTheme();
  const aceEditorRef = useRef<AceEditor>(null);

  const { displayMode, setDisplayMode, isExpend, toggleExpand } = useDisplayMode(defaultDisplayMode);
  const { isComposing } = useAceComposition(aceEditorRef);
  const {
    markdownValue,
    handleMarkdownChange,
  } = useMarkdownSync({
    editor,
    value,
    onAceChange,
    onTiptapChange,
  });
  const {
    loading,
    progress,
    fileName,
    handleFileUpload,
  } = useMarkdownUpload({
    aceEditorRef,
    onUpload,
  });
  const {
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useMarkdownTransfer({
    aceEditorRef,
    displayMode,
    loading,
    readOnly,
    onFileUpload: handleFileUpload,
  });

  const EditorHeight = useMemo(() => {
    return isExpend ? 'calc(100vh - 45px)' : height;
  }, [isExpend, height]);

  useImperativeHandle(ref, () => ({
    scrollToHeading: (headingText: string) => {
      if (!aceEditorRef.current) return;

      const aceEditor = aceEditorRef.current.editor;
      const lines = markdownValue.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#')) {
          const titleText = line.replace(/^#+\s*/, '').trim();
          if (titleText === headingText.trim()) {
            aceEditor.gotoLine(i + 1, 0, true);
            aceEditor.scrollToLine(i, false, true, () => { });
            break;
          }
        }
      }
    },
  }));

  useEffect(() => {
    const previousEditable = editor.isEditable;
    if (previousEditable) {
      editor.setEditable(false);
    }

    return () => {
      editor.setEditable(previousEditable);
    };
  }, [editor]);

  return <Box sx={{
    position: 'relative',
    bgcolor: 'background.default',
    ...(isExpend && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2000,
    }),
  }}>
    {loading && <UploadProgress progress={progress} fileName={fileName} />}
    {showToolbar && <Stack
      direction='row'
      alignItems={'center'}
      justifyContent={'space-between'}
      sx={{
        p: 0.5,
        border: '1px solid',
        borderColor: 'divider',
        borderBottom: 'none',
        borderRadius: '4px 4px 0 0',
        fontSize: 12,
        lineHeight: '20px',
        color: 'text.tertiary',
        '.md-display-mode-active': {
          color: 'primary.main',
          bgcolor: alpha(theme.palette.primary.main, 0.1),
        },
        '.md-display-mode:hover': {
          borderRadius: '4px',
          bgcolor: 'background.paper3',
        },
      }}
    >
      <EditorMarkdownToolbar
        isExpend={isExpend}
        aceEditorRef={aceEditorRef}
        onFileUpload={handleFileUpload}
      />
      <Stack direction={'row'} alignItems={'center'} gap={1}>
        <IconButton color='inherit' onClick={toggleExpand}>
          {isExpend ? <CollapseIcon sx={{ fontSize: '16px' }} /> : <ExpendIcon sx={{ fontSize: '16px' }} />}
        </IconButton>
        <Stack direction={'row'} alignItems={'center'} sx={{
          p: 0.5,
          borderRadius: '4px',
          border: '1px solid',
          borderColor: 'divider',
        }}>
          <Box
            className={displayMode === 'edit' ? 'md-display-mode-active' : 'md-display-mode'}
            sx={{ px: 1, py: 0.25, cursor: 'pointer', borderRadius: '4px' }}
            onClick={() => setDisplayMode('edit')}
          >
            编辑模式
          </Box>
          <Box
            className={
              displayMode === 'preview' ? 'md-display-mode-active' : 'md-display-mode'
            }
            sx={{ px: 1, py: 0.25, cursor: 'pointer', borderRadius: '4px' }}
            onClick={() => setDisplayMode('preview')}
          >
            预览模式
          </Box>
          {splitMode && <Box
            className={
              displayMode === 'split' ? 'md-display-mode-active' : 'md-display-mode'
            }
            sx={{ px: 1, py: 0.25, cursor: 'pointer', borderRadius: '4px' }}
            onClick={() => setDisplayMode('split')}
          >
            分屏模式
          </Box>}
        </Stack>
      </Stack>
    </Stack>}
    <Stack direction={'row'} alignItems={'stretch'} sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: '0 0 4px 4px',
    }}>
      <Stack
        direction='column'
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          display: ['edit', 'split'].includes(displayMode) ? 'flex' : 'none',
          flex: 1,
          '.ace_placeholder': {
            transform: 'scale(1)',
            height: '100%',
            overflow: 'auto',
            width: '100%',
            fontStyle: 'normal',
            ...(isComposing && {
              display: 'none',
            }),
          },
        }}
      >
        <AceEditor
          ref={aceEditorRef}
          mode='markdown'
          theme='github'
          value={markdownValue}
          onChange={handleMarkdownChange}
          name='project-doc-editor'
          wrapEnabled={true}
          readOnly={loading || !!readOnly}
          showPrintMargin={false}
          placeholder={placeholder || MARKDOWN_EDITOR_PLACEHOLDER}
          fontSize={16}
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            tabSize: 2,
            showGutter: showLineNumbers,
            showLineNumbers: showLineNumbers,
            enableBasicAutocompletion: showAutocomplete,
            enableLiveAutocompletion: showAutocomplete,
            highlightActiveLine: highlightActiveLine,
          }}
          style={{
            width: '100%',
            height: EditorHeight,
          }}
        />
      </Stack>
      {displayMode === 'split' && (
        <Divider orientation='vertical' flexItem />
      )}
      <Box
        id='markdown-preview-container'
        sx={{
          overflowY: 'scroll',
          flex: 1,
          p: 2,
          height: EditorHeight,
          display: ['split', 'preview'].includes(displayMode) ? 'block' : 'none',
          ...(displayMode === 'preview' && isExpend && {
            px: '10%',
          })
        }}
      >
        <TiptapEditor editor={editor} />
      </Box>
    </Stack>
  </Box>
});

EditorMarkdown.displayName = 'EditorMarkdown';

export default EditorMarkdown;
