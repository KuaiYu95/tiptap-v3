import { Box, CircularProgress, FormControl, FormControlLabel, FormLabel, IconButton, Radio, RadioGroup, Stack, TextField, type TextFieldProps } from '@mui/material';
import React from 'react';

export interface ResourceOption<T extends string = string> {
  value: T;
  label: string;
}

export const ResourceFieldRow = ({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Stack direction="row" gap={2} alignItems="center">
    <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', flexShrink: 0 }}>
      {label}
    </Box>
    {children}
  </Stack>
);

export const ResourceTextField = ({
  label,
  textFieldProps,
  endAction,
}: {
  label: React.ReactNode;
  textFieldProps: TextFieldProps;
  endAction?: React.ReactNode;
}) => (
  <ResourceFieldRow label={label}>
    <TextField
      fullWidth
      size="small"
      {...textFieldProps}
    />
    {endAction}
  </ResourceFieldRow>
);

export const ResourceUploadAction = ({
  loading,
  icon,
  onClick,
}: {
  loading: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <IconButton onClick={onClick}>
    {loading ? <CircularProgress size={20} /> : icon}
  </IconButton>
);

export const ResourceRadioField = <T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: React.ReactNode;
  value: T;
  onChange: (value: T) => void;
  options: ResourceOption<T>[];
}) => (
  <FormControl component="fieldset">
    <Stack
      direction="row"
      gap={2}
      alignItems="center"
      sx={{
        '.MuiFormControlLabel-label': {
          fontSize: '0.875rem',
        },
      }}
    >
      <FormLabel component="legend" sx={{ fontSize: '0.875rem', flexShrink: 0 }}>
        {label}
      </FormLabel>
      <RadioGroup
        row
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio size="small" />}
            label={option.label}
          />
        ))}
      </RadioGroup>
    </Stack>
  </FormControl>
);
