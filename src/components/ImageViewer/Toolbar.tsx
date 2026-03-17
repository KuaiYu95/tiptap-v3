import { Box, IconButton, Stack } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AnticlockwiseLineIcon,
  ClockwiseLineIcon,
  CloseCircleFillIcon,
  Download2LineIcon,
  FullscreenExitLineIcon,
  FullscreenLineIcon,
  ResetLeftFillIcon,
  SkipLeftIcon,
  SkipRightIcon,
} from '../Icons';
import { ImageViewerContext } from './context';

const iconButtonSx = {
  color: 'white',
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
};

const Divider = () => (
  <Box
    sx={{
      width: '1px',
      height: '24px',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      mx: 0.5,
    }}
  />
);

const ZoomInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 768 768" fill="currentColor">
    <path d="M384 640.5q105 0 180.75-75.75t75.75-180.75-75.75-180.75-180.75-75.75-180.75 75.75-75.75 180.75 75.75 180.75 180.75 75.75zM384 64.5q132 0 225.75 93.75t93.75 225.75-93.75 225.75-225.75 93.75-225.75-93.75-93.75-225.75 93.75-225.75 225.75-93.75zM415.5 223.5v129h129v63h-129v129h-63v-129h-129v-63h129v-129h63z" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 768 768" fill="currentColor">
    <path d="M384 640.5q105 0 180.75-75.75t75.75-180.75-75.75-180.75-180.75-75.75-180.75 75.75-75.75 180.75 75.75 180.75 180.75 75.75zM384 64.5q132 0 225.75 93.75t93.75 225.75-93.75 225.75-225.75 93.75-225.75-93.75-93.75-225.75 93.75-225.75 225.75-93.75zM223.5 352.5h321v63h-321v-63z" />
  </svg>
);

export const CustomToolbar: React.FC = () => {
  const {
    visible,
    currentSrc,
    currentIndex,
    totalImages,
    getScale,
    getRotate,
    getOnScale,
    getOnRotate,
    getOnClose,
    onPrevImage,
    onNextImage,
  } = useContext(ImageViewerContext);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleDownload = useCallback(() => {
    if (currentSrc) {
      const link = document.createElement('a');
      link.href = currentSrc;
      link.download = currentSrc.split('/').pop() || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [currentSrc]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const handleZoom = useCallback(
    (delta: number) => {
      const onScaleFn = getOnScale();
      if (onScaleFn) {
        const currentScale = getScale();
        const newScale = Math.max(0.5, Math.min(5, currentScale + delta));
        onScaleFn(newScale);
      }
    },
    [getOnScale, getScale]
  );

  const handleRotate = useCallback(
    (delta: number) => {
      const onRotateFn = getOnRotate();
      if (onRotateFn) {
        const currentRotate = getRotate();
        onRotateFn(currentRotate + delta);
      }
    },
    [getOnRotate, getRotate]
  );

  const handleReset = useCallback(() => {
    getOnScale()?.(1);
    getOnRotate()?.(0);
  }, [getOnScale, getOnRotate]);

  const handleClose = useCallback(() => {
    getOnClose()?.();
  }, [getOnClose]);

  if (!visible) return null;

  const toolbarContent = (
    <Box
      className="PhotoView-Slider__toolbar-custom"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px 24px',
        zIndex: 10000,
        pointerEvents: 'none',
        '& > *': {
          pointerEvents: 'auto',
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '8px',
          padding: '8px 12px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <IconButton
          onClick={onPrevImage}
          sx={iconButtonSx}
          size="small"
          disabled={totalImages <= 1}
        >
          <SkipLeftIcon sx={{ fontSize: '20px' }} />
        </IconButton>

        <IconButton
          onClick={onNextImage}
          sx={iconButtonSx}
          size="small"
          disabled={totalImages <= 1}
        >
          <SkipRightIcon sx={{ fontSize: '20px' }} />
        </IconButton>

        <Divider />

        <IconButton onClick={() => handleZoom(0.5)} sx={iconButtonSx} size="small">
          <ZoomInIcon />
        </IconButton>

        <IconButton onClick={() => handleZoom(-0.5)} sx={iconButtonSx} size="small">
          <ZoomOutIcon />
        </IconButton>

        <Divider />

        <IconButton onClick={() => handleRotate(-90)} sx={iconButtonSx} size="small">
          <AnticlockwiseLineIcon sx={{ fontSize: '20px' }} />
        </IconButton>

        <IconButton onClick={() => handleRotate(90)} sx={iconButtonSx} size="small">
          <ClockwiseLineIcon sx={{ fontSize: '20px' }} />
        </IconButton>

        <Divider />

        <IconButton onClick={handleReset} sx={iconButtonSx} size="small">
          <ResetLeftFillIcon sx={{ fontSize: '20px' }} />
        </IconButton>

        {currentSrc && (
          <>
            <Divider />
            <IconButton onClick={handleDownload} sx={iconButtonSx} size="small">
              <Download2LineIcon sx={{ fontSize: '20px' }} />
            </IconButton>
          </>
        )}

        <Divider />

        <IconButton onClick={handleFullscreen} sx={iconButtonSx} size="small">
          {isFullscreen ? (
            <FullscreenExitLineIcon sx={{ fontSize: '20px' }} />
          ) : (
            <FullscreenLineIcon sx={{ fontSize: '20px' }} />
          )}
        </IconButton>

        <Divider />

        <IconButton onClick={handleClose} sx={iconButtonSx} size="small">
          <CloseCircleFillIcon sx={{ fontSize: '20px' }} />
        </IconButton>
      </Stack>
    </Box>
  );

  if (typeof document !== 'undefined') {
    return createPortal(toolbarContent, document.body);
  }

  return toolbarContent;
};

