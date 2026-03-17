import { getShortcutKeyText } from '../../utils';
import { Theme } from '@emotion/react';
import { Box, Button, Stack, SxProps, Tooltip } from '@mui/material';
import React from 'react';

interface ToolbarItemProps {
  tip?: string;
  customComponent?: React.ReactNode
  text?: React.ReactNode;
  shortcutKey?: string[];
  sx?: SxProps<Theme>;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const ToolbarItem = React.forwardRef<HTMLButtonElement, ToolbarItemProps>(({
  tip,
  customComponent,
  shortcutKey,
  icon,
  sx,
  text,
  onClick,
  className,
  disabled,
  ...rest
}, ref) => {
  const shortcutKeyText = getShortcutKeyText(shortcutKey || []);

  return (
    <Tooltip
      arrow
      title={tip ? (
        <>
          <Stack alignItems="center" {...(customComponent ? { direction: 'row', justifyContent: 'center', gap: 1 } : {})}>
            <Box>{tip}</Box>
            {shortcutKeyText && (
              <Box sx={{ fontSize: 12 }}>{shortcutKeyText}</Box>
            )}
          </Stack>
          {customComponent}
        </>
      ) : null}
    >
      <Box>
        <Button
          ref={ref}
          onClick={onClick}
          className={className}
          disabled={disabled}
          sx={{
            minHeight: '36px',
            minWidth: '36px',
            p: 1,
            color: 'text.primary',
            '&.tool-active': {
              bgcolor: 'background.paper2',
              color: 'primary.main',
            },
            '&[disabled]': {
              color: 'text.disabled',
            },
            '&:hover': {
              bgcolor: 'background.paper2',
            },
            textTransform: 'none',
            ...sx,
          }}
          {...rest}
        >
          <Stack
            direction={'row'}
            alignItems={'center'}
            gap={0.5}
            sx={{ lineHeight: 1, flexShrink: 0 }}
          >
            {icon}
            {text && <Box component="span">{text}</Box>}
          </Stack>
        </Button>
      </Box>
    </Tooltip>
  );
},
);

ToolbarItem.displayName = 'toolbar-item';

export default ToolbarItem;
