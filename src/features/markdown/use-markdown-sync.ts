import { Editor } from '@tiptap/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type UseMarkdownSyncProps = {
  editor: Editor;
  value?: string;
  onAceChange?: (value: string) => void;
  onTiptapChange?: (value: string) => void;
};

export const useMarkdownSync = ({
  editor,
  value,
  onAceChange,
  onTiptapChange,
}: UseMarkdownSyncProps) => {
  const initialMarkdown = useMemo(
    () => value ?? editor.getMarkdown?.() ?? '',
    [editor, value],
  );
  const syncedMarkdownRef = useRef<string>(initialMarkdown);
  const [markdownValue, setMarkdownValue] = useState(initialMarkdown);

  const updateMarkdownValue = React.useCallback((nextValue: string) => {
    syncedMarkdownRef.current = nextValue;
    setMarkdownValue(nextValue);
  }, []);

  const handleMarkdownChange = React.useCallback((nextValue: string) => {
    updateMarkdownValue(nextValue);
    onAceChange?.(nextValue);
    onTiptapChange?.(nextValue);
    editor.commands.setContent(nextValue, {
      contentType: 'markdown',
    });
  }, [editor, onAceChange, onTiptapChange, updateMarkdownValue]);

  useEffect(() => {
    if (value === undefined || value === syncedMarkdownRef.current) {
      return;
    }

    updateMarkdownValue(value);
    editor.commands.setContent(value, {
      contentType: 'markdown',
    });
  }, [editor, updateMarkdownValue, value]);

  useEffect(() => {
    if (value !== undefined) {
      return;
    }

    const nextMarkdown = editor.getMarkdown?.() ?? '';
    updateMarkdownValue(nextMarkdown);
  }, [editor, updateMarkdownValue, value]);

  return {
    markdownValue,
    setMarkdownValue: updateMarkdownValue,
    handleMarkdownChange,
  };
};
