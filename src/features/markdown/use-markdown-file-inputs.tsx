import React from 'react';
import { MarkdownUploadType } from './use-markdown-upload';

interface UseMarkdownFileInputsProps {
  onFileUpload: (file: File, expectedType?: MarkdownUploadType) => void;
}

export const useMarkdownFileInputs = ({ onFileUpload }: UseMarkdownFileInputsProps) => {
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const audioInputRef = React.useRef<HTMLInputElement>(null);
  const attachmentInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = React.useCallback((
    event: React.ChangeEvent<HTMLInputElement>,
    expectedType?: MarkdownUploadType,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file, expectedType);
    }
    event.target.value = '';
  }, [onFileUpload]);

  const openPicker = React.useCallback((type: MarkdownUploadType) => {
    if (type === 'image') imageInputRef.current?.click();
    if (type === 'video') videoInputRef.current?.click();
    if (type === 'audio') audioInputRef.current?.click();
    if (type === 'attachment') attachmentInputRef.current?.click();
  }, []);

  const inputs = React.useMemo(() => (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(event) => handleFileSelect(event, 'image')}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={(event) => handleFileSelect(event, 'video')}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={(event) => handleFileSelect(event, 'audio')}
      />
      <input
        ref={attachmentInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={(event) => handleFileSelect(event, 'attachment')}
      />
    </>
  ), [handleFileSelect]);

  return {
    inputs,
    openPicker,
  };
};
