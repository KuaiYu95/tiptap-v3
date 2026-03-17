import { Box, CircularProgress, Stack, SxProps, Theme } from '@mui/material';
import React from 'react';
import { UploadFileType } from '../../../../utils/file';
import { getUploadFileIcon, getUploadFileTypeText } from './file-meta';

export interface UploadProgressDisplayProps {
  fileName: string;
  fileType: UploadFileType;
  progress: number;
}

export const getUploadProgressContainerSx = (
  progress: number,
  extraSx?: SxProps<Theme>,
): SxProps<Theme> => ({
  position: 'relative',
  border: '1px dashed',
  borderColor: 'divider',
  borderRadius: 'var(--mui-shape-borderRadius)',
  p: 2,
  ...(!progress ? {
    cursor: 'pointer',
    '&:hover': {
      bgcolor: 'action.hover',
    },
    '&:active': {
      bgcolor: 'action.selected',
    },
  } : {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      width: `${progress * 100}%`,
      bgcolor: 'primary.main',
      opacity: 0.1,
      transition: 'width 0.3s ease',
    },
  }),
  ...(extraSx as object),
});

export const UploadProgressContent = ({
  fileName,
  fileType,
  progress,
}: UploadProgressDisplayProps) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
    <Stack direction="row" alignItems="center" gap={2}>
      {getUploadFileIcon(fileType)}
      <Box sx={{ fontSize: '0.875rem', color: 'text.primary' }}>
        正在上传{getUploadFileTypeText(fileType)}：{fileName}
      </Box>
    </Stack>
    <Stack direction="row" alignItems="center" gap={1}>
      {progress < 1 && <CircularProgress size={14} />}
      <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
        {Math.round(progress * 100)}%
      </Box>
    </Stack>
  </Stack>
);
