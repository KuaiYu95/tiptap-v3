import React from 'react';
import AceEditor from 'react-ace';
import { UploadFunction } from '../../types';
import { insertInlineTool } from './util';

export type MarkdownUploadType = 'image' | 'video' | 'audio' | 'attachment';

const buildUploadedContent = (fileName: string, url: string, expectedType: MarkdownUploadType) => {
  if (expectedType === 'image') {
    return `![${fileName}](${url})`;
  }

  if (expectedType === 'video') {
    return `<video src="${url}" controls="true"></video>`;
  }

  if (expectedType === 'audio') {
    return `<audio src="${url}" controls="true"></audio>`;
  }

  return `<a href="${url}" download="${fileName}">${fileName}</a>`;
};

export const useMarkdownUpload = ({
  aceEditorRef,
  onUpload,
}: {
  aceEditorRef: React.RefObject<AceEditor | null>;
  onUpload?: UploadFunction;
}) => {
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [fileName, setFileName] = React.useState('');

  const handleFileUpload = React.useCallback(async (
    file: File,
    expectedType: MarkdownUploadType = 'attachment',
  ) => {
    if (!onUpload || !aceEditorRef.current) return;

    try {
      setLoading(true);
      setFileName(file.name);
      const url = await onUpload(file, (nextProgress) => {
        setProgress(Math.round(nextProgress.progress * 100));
      });

      const content = buildUploadedContent(file.name, url, expectedType);

      insertInlineTool(aceEditorRef.current, { left: content, position: 1000 });
    } catch (error) {
      console.error('文件上传失败:', error);
    } finally {
      setLoading(false);
      setFileName('');
      setProgress(0);
    }
  }, [aceEditorRef, onUpload]);

  return {
    loading,
    progress,
    fileName,
    handleFileUpload,
  };
};
