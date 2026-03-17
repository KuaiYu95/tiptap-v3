import type { UploadFunction } from '../../../../types';
import React from 'react';

export const useFileUploadField = ({
  onUpload,
  onError,
  onUploaded,
  trackProgress = false,
}: {
  onUpload?: UploadFunction;
  onError?: (error: Error) => void;
  onUploaded: (value: { url: string; file: File }) => void;
  trackProgress?: boolean;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const openPicker = React.useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !onUpload) {
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const url = await onUpload(file, trackProgress
        ? (progressEvent) => setProgress(Math.round(progressEvent.progress * 100))
        : undefined);

      onUploaded({ url, file });
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [onError, onUpload, onUploaded, trackProgress]);

  return {
    inputRef,
    uploading,
    progress,
    openPicker,
    handleChange,
  };
};

export const uploadFilesSequentially = async ({
  files,
  onUpload,
  onFileStart,
  onProgress,
  onFileSuccess,
  onFileError,
}: {
  files: File[];
  onUpload?: UploadFunction;
  onFileStart?: (file: File, index: number) => void;
  onProgress?: (progress: number, file: File, index: number) => void;
  onFileSuccess?: (result: string, file: File, index: number) => void;
  onFileError?: (error: Error, file: File, index: number) => void;
}) => {
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    onFileStart?.(file, index);

    try {
      const result = await onUpload?.(file, ({ progress }) => {
        onProgress?.(Math.round(progress * 100), file, index);
      });

      onFileSuccess?.(result || '', file, index);
    } catch (error) {
      onFileError?.(error as Error, file, index);
    }
  }
};
