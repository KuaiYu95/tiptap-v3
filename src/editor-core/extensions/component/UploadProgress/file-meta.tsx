import React from 'react';
import {
  AttachmentLineIcon,
  ImageLineIcon,
  MovieLineIcon,
  Music2LineIcon,
} from '../../../../components/Icons';
import { UploadFileType } from '../../../../utils/file';

export const getUploadFileIcon = (fileType: UploadFileType) => {
  switch (fileType) {
    case 'image':
      return <ImageLineIcon sx={{ fontSize: '1rem' }} />;
    case 'video':
      return <MovieLineIcon sx={{ fontSize: '1rem' }} />;
    case 'audio':
      return <Music2LineIcon sx={{ fontSize: '1rem' }} />;
    default:
      return <AttachmentLineIcon sx={{ fontSize: '1rem' }} />;
  }
};

export const getUploadFileTypeText = (fileType: UploadFileType) => {
  switch (fileType) {
    case 'image':
      return '图片';
    case 'video':
      return '视频';
    case 'audio':
      return '音频';
    default:
      return '文件';
  }
};
