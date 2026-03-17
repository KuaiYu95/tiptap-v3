import React from 'react';
import { getFileType } from '../../utils';
import { MarkdownUploadType } from './use-markdown-upload';

const toMarkdownUploadType = (file: File): MarkdownUploadType => {
  const fileType = getFileType(file);

  if (fileType === 'other') {
    return 'attachment';
  }

  return fileType;
};

export const useMarkdownTransfer = ({
  aceEditorRef,
  displayMode,
  loading,
  readOnly,
  onFileUpload,
}: {
  aceEditorRef: React.RefObject<{ editor: { focus: () => void } } | null>;
  displayMode: 'edit' | 'preview' | 'split';
  loading: boolean;
  readOnly: boolean;
  onFileUpload: (file: File, expectedType?: MarkdownUploadType) => Promise<void>;
}) => {
  const canHandleTransfer = React.useMemo(
    () => ['edit', 'split'].includes(displayMode) && !loading && !readOnly,
    [displayMode, loading, readOnly],
  );

  const handlePaste = React.useCallback(async (event: React.ClipboardEvent) => {
    if (!canHandleTransfer) {
      return;
    }

    const items = Array.from(event.clipboardData.items);
    const imageItem = items.find((item) => item.type.includes('image'));

    if (!imageItem) {
      return;
    }

    event.preventDefault();
    const file = imageItem.getAsFile();

    if (file) {
      await onFileUpload(file, 'image');
    }
  }, [canHandleTransfer, onFileUpload]);

  const handleDragOver = React.useCallback((event: React.DragEvent) => {
    if (!canHandleTransfer) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }, [canHandleTransfer]);

  const handleDragLeave = React.useCallback((event: React.DragEvent) => {
    if (!canHandleTransfer) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }, [canHandleTransfer]);

  const handleDrop = React.useCallback(async (event: React.DragEvent) => {
    if (!canHandleTransfer) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    aceEditorRef.current?.editor.focus();

    const files = Array.from(event.dataTransfer.files);

    for (const file of files) {
      await onFileUpload(file, toMarkdownUploadType(file));
    }
  }, [aceEditorRef, canHandleTransfer, onFileUpload]);

  return {
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};
