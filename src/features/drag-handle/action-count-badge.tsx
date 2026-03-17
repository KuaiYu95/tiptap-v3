import { Box } from '@mui/material';
import React from 'react';

const ActionCountBadge = ({ count }: { count: number }) => (
  <Box sx={{
    lineHeight: '0.75rem',
    fontSize: '0.75rem',
    color: 'text.disabled',
    border: '1px solid',
    borderColor: 'text.disabled',
    borderRadius: 'var(--mui-shape-borderRadius)',
    py: 0,
    px: 0.5,
    minWidth: '1.25rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    {count}
  </Box>
);

export default ActionCountBadge;
