import { FloatingPopover } from '../../../../components/FloatingPopover';
import { Box, Stack, Tab, Tabs } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';

type InsertType = 'upload' | 'link';

interface UseInsertPopoverReturn<T extends HTMLElement> {
  anchorEl: T | null;
  triggerRef: React.RefObject<T>;
  openFromEvent: (event: React.MouseEvent<T>) => void;
  openFromTrigger: () => void;
  close: () => void;
  isOpen: boolean;
}

export function useInsertPopover<T extends HTMLElement>(): UseInsertPopoverReturn<T> {
  const [anchorEl, setAnchorEl] = useState<T | null>(null);
  const triggerRef = useRef<T>(null!);

  const openFromEvent = useCallback((event: React.MouseEvent<T>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const openFromTrigger = useCallback(() => {
    if (triggerRef.current) {
      setAnchorEl(triggerRef.current);
    }
  }, []);

  const close = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return {
    anchorEl,
    triggerRef,
    openFromEvent,
    openFromTrigger,
    close,
    isOpen: Boolean(anchorEl),
  };
}

interface InsertTriggerCardProps {
  icon: React.ReactNode;
  text: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  uploading?: boolean;
  uploadProgress?: number;
  minWidth?: number;
  dragHandle?: boolean;
}

export const InsertTriggerCard = React.forwardRef<HTMLDivElement, InsertTriggerCardProps>(
  ({
    icon,
    text,
    onClick,
    uploading = false,
    uploadProgress = 0,
    minWidth = 200,
    dragHandle = false,
  }, ref) => (
    <Stack
      ref={ref}
      direction="row"
      alignItems="center"
      gap={2}
      onClick={!uploading ? onClick : undefined}
      {...(dragHandle ? { 'data-drag-handle': true } : {})}
      sx={{
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 'var(--mui-shape-borderRadius)',
        px: 2,
        py: 1.5,
        minWidth,
        textAlign: 'center',
        color: 'text.secondary',
        bgcolor: 'action.default',
        position: 'relative',
        overflow: 'hidden',
        ...(!uploading
          ? {
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
            },
            '&:active': {
              bgcolor: 'action.selected',
            },
          }
          : {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${uploadProgress}%`,
              bgcolor: 'primary.main',
              opacity: 0.1,
              transition: 'width 0.3s ease',
            },
          }),
      }}
    >
      <Box sx={{ fontSize: '1rem', position: 'relative', flexShrink: 0 }}>
        {icon}
      </Box>
      <Box sx={{ fontSize: '0.875rem', position: 'relative', flexGrow: 1, textAlign: 'left' }}>
        {text}
      </Box>
      {uploading && (
        <Box
          sx={{
            fontSize: 12,
            fontWeight: 'bold',
            color: 'primary.main',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {uploadProgress}%
        </Box>
      )}
    </Stack>
  )
);

InsertTriggerCard.displayName = 'InsertTriggerCard';

interface InsertPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  children: React.ReactNode;
}

export const InsertPopover = ({
  open,
  anchorEl,
  onClose,
  children,
}: InsertPopoverProps) => (
  <FloatingPopover
    open={open}
    anchorEl={anchorEl}
    onClose={onClose}
    placement="bottom"
  >
    {children}
  </FloatingPopover>
);

interface InsertTabsHeaderProps {
  value: InsertType;
  onChange: (event: React.SyntheticEvent, newValue: string) => void;
}

export const InsertTabsHeader = ({
  value,
  onChange,
}: InsertTabsHeaderProps) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="center"
    sx={{ width: 350, borderBottom: '1px solid', borderColor: 'divider' }}
  >
    <Tabs
      value={value}
      onChange={onChange}
      sx={{
        borderRadius: '0 !important',
        height: 'auto !important',
        padding: '0 !important',
      }}
    >
      <Tab label="上传" value="upload" />
      <Tab label="嵌入链接" value="link" />
    </Tabs>
  </Stack>
);
