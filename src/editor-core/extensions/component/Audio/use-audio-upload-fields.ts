import { UploadFunction } from '../../../../types';
import React from 'react';
import { useFileUploadField } from '../shared/upload-flow';

export const useAudioUploadFields = ({
  onUpload,
  onError,
  onAudioUploaded,
  onPosterUploaded,
}: {
  onUpload?: UploadFunction;
  onError?: (error: Error) => void;
  onAudioUploaded: (value: { url: string; fileName: string }) => void;
  onPosterUploaded: (url: string) => void;
}) => {
  const {
    inputRef: audioInputRef,
    uploading: uploadingAudio,
    progress: audioUploadProgress,
    openPicker: openAudioPicker,
    handleChange: handleAudioUpload,
  } = useFileUploadField({
    onUpload,
    onError,
    trackProgress: true,
    onUploaded: ({ url, file }) => {
      onAudioUploaded({
        url,
        fileName: file.name,
      });
    },
  });

  const {
    inputRef: posterInputRef,
    uploading: uploadingPoster,
    openPicker: openPosterPicker,
    handleChange: handlePosterUpload,
  } = useFileUploadField({
    onUpload,
    onError,
    onUploaded: ({ url }) => {
      onPosterUploaded(url);
    },
  });

  return {
    audioInputRef,
    posterInputRef,
    uploadingAudio,
    uploadingPoster,
    audioUploadProgress,
    openAudioPicker,
    openPosterPicker,
    handleAudioUpload,
    handlePosterUpload,
  };
};
