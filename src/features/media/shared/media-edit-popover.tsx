import React from 'react';
import { Box, Stack, TextField } from '@mui/material';
import { EditPopoverActions, EditPopoverShell } from '../../../editor-core/extensions/component/shared/edit-popover';

interface BaseMediaEditPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSave: () => void;
}

export const MediaEditPopover = ({
  open,
  anchorEl,
  onClose,
  label,
  value,
  onChange,
  placeholder,
  onSave,
  multiline = false,
  rows,
}: BaseMediaEditPopoverProps & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  rows?: number;
}) => {
  return (
    <EditPopoverShell
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
    >
      <Stack sx={{ p: 2, width: 350 }}>
        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: '1.5', mb: 1 }}>
          {label}
        </Box>
        <TextField
          fullWidth
          multiline={multiline}
          rows={rows}
          size="small"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        <EditPopoverActions
          onCancel={onClose}
          onConfirm={onSave}
          confirmDisabled={!value.trim()}
        />
      </Stack>
    </EditPopoverShell>
  );
};

export const MediaDualFieldEditPopover = ({
  open,
  anchorEl,
  onClose,
  primaryLabel,
  primaryValue,
  onPrimaryChange,
  primaryPlaceholder,
  secondaryLabel,
  secondaryValue,
  onSecondaryChange,
  secondaryPlaceholder,
  onSave,
}: BaseMediaEditPopoverProps & {
  primaryLabel: string;
  primaryValue: string;
  onPrimaryChange: (value: string) => void;
  primaryPlaceholder: string;
  secondaryLabel: string;
  secondaryValue: string;
  onSecondaryChange: (value: string) => void;
  secondaryPlaceholder: string;
}) => (
  <EditPopoverShell
    open={open}
    anchorEl={anchorEl}
    onClose={onClose}
  >
    <Stack sx={{ p: 2, width: 350 }}>
      <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: '1.5', mb: 1 }}>
        {primaryLabel}
      </Box>
      <TextField
        fullWidth
        size="small"
        value={primaryValue}
        onChange={(event) => onPrimaryChange(event.target.value)}
        placeholder={primaryPlaceholder}
      />
      <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: '1.5', my: 1 }}>
        {secondaryLabel}
      </Box>
      <TextField
        fullWidth
        size="small"
        value={secondaryValue}
        onChange={(event) => onSecondaryChange(event.target.value)}
        placeholder={secondaryPlaceholder}
      />
      <EditPopoverActions
        onCancel={onClose}
        onConfirm={onSave}
        confirmDisabled={!primaryValue.trim()}
      />
    </Stack>
  </EditPopoverShell>
);
