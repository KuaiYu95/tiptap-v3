export type UploadFileType = 'image' | 'video' | 'audio' | 'other';

export const getFileType = (file: File): UploadFileType => {
  const { type } = file;

  if (type.startsWith('image/')) {
    return 'image';
  }

  if (type.startsWith('video/')) {
    return 'video';
  }

  if (type.startsWith('audio/')) {
    return 'audio';
  }

  return 'other';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const unit = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(unit)),
    sizes.length - 1,
  );

  return `${parseFloat((bytes / unit ** index).toFixed(2))} ${sizes[index]}`;
};
