import React from 'react';

export const usePopoverAnchor = <T extends HTMLElement = HTMLElement>() => {
  const [anchorEl, setAnchorEl] = React.useState<T | null>(null);

  const open = React.useCallback((event: React.MouseEvent<T>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const close = React.useCallback(() => {
    setAnchorEl(null);
  }, []);

  return {
    anchorEl,
    setAnchorEl,
    open,
    close,
    isOpen: Boolean(anchorEl),
  };
};
