import { alpha, Box, Paper, useTheme } from "@mui/material";
import React from "react";

interface UploadProgressProps {
  progress: number;
  fileName: string;
}

const UploadProgress = ({ progress, fileName }: UploadProgressProps) => {
  const theme = useTheme();

  return <Paper sx={{
    position: 'absolute',
    left: '50%',
    top: 45,
    overflow: 'hidden',
    px: 2,
    py: 1,
    transform: 'translateX(-50%)',
    bgcolor: 'background.default',
    fontSize: 12,
    color: 'text.disabled',
    boxShadow: `0px 4px 20px ${alpha(theme.palette.info.main, 0.25)}, 0px 0px 10px ${alpha(theme.palette.info.main, 0.15)}`,
    borderRadius: 2,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: `${progress}%`,
      height: '100%',
      background: `linear-gradient(90deg, 
        ${alpha(theme.palette.info.main, 0.2)} 0%, 
        ${alpha(theme.palette.info.main, 0.35)} 50%, 
        ${alpha(theme.palette.info.main, 0.2)} 100%)`,
      transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 0,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: `${progress}%`,
      height: '100%',
      background: `linear-gradient(90deg, 
        transparent 0%, 
        ${alpha(theme.palette.info.light || '#74CAFF', 0.4)} 50%, 
        transparent 100%)`,
      backgroundSize: '200% 100%',
      animation: progress >= 100 ? 'none' : 'shimmer 2s infinite',
      transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 1,
      '@keyframes shimmer': {
        '0%': {
          backgroundPosition: '-200% 0',
        },
        '100%': {
          backgroundPosition: '200% 0',
        },
      },
    },
  }}>
    <Box sx={{ position: 'relative', zIndex: 2 }}>
      正在上传文件：{fileName} <Box component={'span'} sx={{
        color: 'info.main',
        display: 'inline-block',
        ml: 2,
        fontWeight: 600,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        textShadow: `0 0 8px ${alpha(theme.palette.info.main, 0.6)}`,
        animation: progress >= 100 ? 'none' : 'pulse 2s ease-in-out infinite',
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
            transform: 'scale(1)',
          },
          '50%': {
            opacity: 0.8,
            transform: 'scale(1.05)',
          },
        },
      }}>{progress}%</Box>
    </Box>
  </Paper>
}

export default UploadProgress;