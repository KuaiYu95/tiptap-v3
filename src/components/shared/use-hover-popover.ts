import React from 'react';

export const useHoverPopover = ({
  disabled,
  keepOpen,
  hoverDelay,
  closeDelay,
}: {
  disabled: boolean;
  keepOpen: boolean;
  hoverDelay: number;
  closeDelay: number;
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const childRef = React.useRef<HTMLDivElement>(null);
  const hoverTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearHoverTimer = React.useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const clearTimers = React.useCallback(() => {
    clearHoverTimer();
    clearCloseTimer();
  }, [clearCloseTimer, clearHoverTimer]);

  React.useEffect(() => {
    if (keepOpen && !anchorEl && childRef.current) {
      setAnchorEl(childRef.current);
    }
  }, [anchorEl, keepOpen]);

  React.useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const handleMouseEnter = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      return;
    }

    clearCloseTimer();
    clearHoverTimer();

    const target = event.currentTarget as HTMLElement;
    hoverTimerRef.current = setTimeout(() => {
      setAnchorEl(target);
      hoverTimerRef.current = null;
    }, hoverDelay);
  }, [clearCloseTimer, clearHoverTimer, disabled, hoverDelay]);

  const handleMouseLeave = React.useCallback(() => {
    if (disabled || keepOpen) {
      return;
    }

    clearHoverTimer();
    clearCloseTimer();

    closeTimerRef.current = setTimeout(() => {
      setAnchorEl(null);
      closeTimerRef.current = null;
    }, closeDelay);
  }, [clearCloseTimer, clearHoverTimer, closeDelay, disabled, keepOpen]);

  const handlePopoverMouseEnter = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    clearTimers();
  }, [clearTimers]);

  const handlePopoverMouseLeave = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();

    if (keepOpen) {
      return;
    }

    handleMouseLeave();
  }, [handleMouseLeave, keepOpen]);

  const handleForceClose = React.useCallback(() => {
    if (keepOpen) {
      return;
    }

    clearTimers();
    setAnchorEl(null);
  }, [clearTimers, keepOpen]);

  return {
    anchorEl,
    childRef,
    handleMouseEnter,
    handleMouseLeave,
    handlePopoverMouseEnter,
    handlePopoverMouseLeave,
    handleForceClose,
  };
};
