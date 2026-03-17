import { Box } from '@mui/material';
import React from 'react';

export interface MenuSurfaceProps {
  children: React.ReactNode;
  width?: React.CSSProperties['width'];
  minWidth?: React.CSSProperties['minWidth'];
  maxHeight?: React.CSSProperties['maxHeight'];
  lineHeight?: number;
  p?: number;
  className?: string;
  sx?: Record<string, unknown>;
}

export const MenuSurface: React.FC<MenuSurfaceProps> = ({
  children,
  width,
  minWidth = 160,
  maxHeight,
  lineHeight = 1.625,
  p = 0.5,
  className,
  sx,
}) => (
  <Box
    className={className}
    sx={{
      p,
      minWidth,
      lineHeight,
      overflow: 'auto',
      ...(width ? { width } : {}),
      ...(maxHeight ? { maxHeight } : {}),
      ...(sx || {}),
    }}
  >
    {children}
  </Box>
);

export default MenuSurface;
