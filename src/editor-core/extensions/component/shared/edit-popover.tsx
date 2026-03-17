import { FloatingPopover } from '../../../../components';
import { Button, Stack } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';

interface UseAnchoredPopoverReturn<T extends HTMLElement> {
  anchorEl: T | null;
  anchorRef: React.RefObject<T>;
  isOpen: boolean;
  openFromRef: () => void;
  openFromElement: (element: T | null) => void;
  openFromEvent: (event: React.MouseEvent<T>) => void;
  close: () => void;
}

export function useAnchoredPopover<T extends HTMLElement>(): UseAnchoredPopoverReturn<T> {
  const [anchorEl, setAnchorEl] = useState<T | null>(null);
  const anchorRef = useRef<T>(null!);

  const openFromRef = useCallback(() => {
    if (anchorRef.current) {
      setAnchorEl(anchorRef.current);
    }
  }, []);

  const openFromElement = useCallback((element: T | null) => {
    if (element) {
      setAnchorEl(element);
    }
  }, []);

  const openFromEvent = useCallback((event: React.MouseEvent<T>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const close = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return {
    anchorEl,
    anchorRef,
    isOpen: Boolean(anchorEl),
    openFromRef,
    openFromElement,
    openFromEvent,
    close,
  };
}

interface EditPopoverShellProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  children: React.ReactNode;
}

export const EditPopoverShell = ({
  open,
  anchorEl,
  onClose,
  children,
}: EditPopoverShellProps) => (
  <FloatingPopover
    open={open}
    anchorEl={anchorEl}
    onClose={onClose}
    placement="bottom"
  >
    {children}
  </FloatingPopover>
);

interface EditPopoverActionsProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmDisabled?: boolean;
}

export const EditPopoverActions = ({
  onCancel,
  onConfirm,
  confirmText = '保存',
  cancelText = '取消',
  confirmDisabled = false,
}: EditPopoverActionsProps) => (
  <Stack direction="row" gap={1} alignItems="center" sx={{ mt: 2 }}>
    <Button
      variant="outlined"
      size="small"
      fullWidth
      onClick={onCancel}
    >
      {cancelText}
    </Button>
    <Button
      variant="contained"
      size="small"
      fullWidth
      onClick={onConfirm}
      disabled={confirmDisabled}
    >
      {confirmText}
    </Button>
  </Stack>
);
