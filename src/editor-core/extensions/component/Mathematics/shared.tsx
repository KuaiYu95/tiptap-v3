import { Button, Stack, TextField } from '@mui/material';
import katex from 'katex';
import React from 'react';

export type MathAttributes = {
  latex: string;
};

export const createMathAttributes = (
  base: MathAttributes,
  overrides: Partial<MathAttributes> = {},
): MathAttributes => ({
  latex: base.latex,
  ...overrides,
});

export const renderMathToElement = ({
  latex,
  element,
  displayMode,
  onError,
}: {
  latex?: string;
  element: HTMLElement | null;
  displayMode: boolean;
  onError?: (error: Error) => void;
}) => {
  if (!element || !latex) {
    return;
  }

  try {
    katex.render(latex, element, {
      throwOnError: false,
      displayMode,
      errorColor: 'error.main',
      output: 'html',
    });
  } catch (error) {
    onError?.(error as Error);
  }
};

export const MathEditorPopover = ({
  value,
  onChange,
  onSubmit,
  multiline,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  multiline?: boolean;
  placeholder: string;
}) => (
  <Stack gap={2} sx={{ p: 2, width: 350 }}>
    <TextField
      fullWidth
      multiline={multiline}
      rows={multiline ? 4 : 3}
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
    <Button
      variant="contained"
      size="small"
      fullWidth
      onClick={onSubmit}
      disabled={!value.trim()}
    >
      插入公式
    </Button>
  </Stack>
);
