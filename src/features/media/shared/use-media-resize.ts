import React from 'react';

export type ResizeCorner =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export const useMediaResize = ({
  enabled = true,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  getInitialWidth,
  getInitialHeight,
  onResize,
  mode,
}: {
  enabled?: boolean;
  minWidth: number;
  maxWidth: () => number;
  minHeight?: number;
  maxHeight?: number;
  getInitialWidth: () => number;
  getInitialHeight?: () => number;
  onResize: (size: { width: number; height?: number }) => void;
  mode: 'width' | 'size';
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragCorner, setDragCorner] = React.useState<ResizeCorner | null>(null);

  const dragStartXRef = React.useRef(0);
  const dragStartYRef = React.useRef(0);
  const dragStartWidthRef = React.useRef(0);
  const dragStartHeightRef = React.useRef(0);
  const maxWidthRef = React.useRef(0);

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent, corner: ResizeCorner) => {
      if (!enabled) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      setIsDragging(true);
      setDragCorner(corner);
      dragStartXRef.current = event.clientX;
      dragStartYRef.current = event.clientY;
      dragStartWidthRef.current = getInitialWidth();
      dragStartHeightRef.current = getInitialHeight?.() ?? 0;
      maxWidthRef.current = maxWidth();
    },
    [enabled, getInitialHeight, getInitialWidth, maxWidth],
  );

  const handleMouseMove = React.useCallback(
    (event: MouseEvent) => {
      if (!enabled || !isDragging || !dragCorner) {
        return;
      }

      const deltaX = event.clientX - dragStartXRef.current;
      const deltaY = event.clientY - dragStartYRef.current;

      const nextWidth =
        dragCorner === 'top-right' || dragCorner === 'bottom-right'
          ? dragStartWidthRef.current + deltaX
          : dragStartWidthRef.current - deltaX;

      const width = Math.max(minWidth, Math.min(maxWidthRef.current, nextWidth));

      if (mode === 'width') {
        onResize({ width });
        return;
      }

      const nextHeight =
        dragCorner === 'bottom-left' || dragCorner === 'bottom-right'
          ? dragStartHeightRef.current + deltaY
          : dragStartHeightRef.current - deltaY;

      const boundedHeight = Math.max(
        minHeight ?? 0,
        Math.min(maxHeight ?? Number.POSITIVE_INFINITY, nextHeight),
      );

      onResize({
        width,
        height: boundedHeight,
      });
    },
    [
      dragCorner,
      enabled,
      isDragging,
      maxHeight,
      minHeight,
      minWidth,
      mode,
      onResize,
    ],
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
    setDragCorner(null);
  }, []);

  React.useEffect(() => {
    if (!isDragging) {
      return;
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, isDragging]);

  return {
    isDragging,
    dragCorner,
    handleMouseDown,
  };
};
