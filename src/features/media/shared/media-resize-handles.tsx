import React from 'react';
import { alpha, Box, useTheme } from '@mui/material';
import type { ResizeCorner } from './use-media-resize';

const HANDLE_CONFIGS: Array<{
  corner: ResizeCorner;
  sx: Record<string, string | number>;
}> = [
  { corner: 'top-left', sx: { left: -4, top: -4, cursor: 'nwse-resize' } },
  { corner: 'top-right', sx: { right: -4, top: -4, cursor: 'nesw-resize' } },
  { corner: 'bottom-left', sx: { left: -4, bottom: -2, cursor: 'nesw-resize' } },
  { corner: 'bottom-right', sx: { right: -4, bottom: -2, cursor: 'nwse-resize' } },
];

export const MediaResizeHandles = ({
  visible,
  dragCorner,
  isDragging,
  onMouseDown,
}: {
  visible: boolean;
  dragCorner: ResizeCorner | null;
  isDragging: boolean;
  onMouseDown: (event: React.MouseEvent, corner: ResizeCorner) => void;
}) => {
  const theme = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <>
      {HANDLE_CONFIGS.map(({ corner, sx }) => (
        <Box
          key={corner}
          onMouseDown={(event) => onMouseDown(event, corner)}
          sx={{
            position: 'absolute',
            width: 12,
            height: 12,
            bgcolor: 'background.default',
            borderRadius: '50%',
            border: '2px solid',
            borderColor:
              isDragging && dragCorner === corner
                ? 'primary.main'
                : alpha(theme.palette.primary.main, 0.3),
            '&:hover': {
              borderColor: 'primary.main',
            },
            transition: 'background-color 0.2s ease',
            ...sx,
          }}
        />
      ))}
    </>
  );
};
