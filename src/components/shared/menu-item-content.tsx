import { Box, Stack } from '@mui/material';
import React from 'react';
import { MenuItem } from '../../types';

export const MenuItemContent = ({
  item,
  arrowIcon,
}: {
  item: MenuItem;
  arrowIcon?: React.ReactNode;
}) => (
  <Stack alignItems="center" gap={1.5} direction="row">
    {item.icon}
    <Box sx={{ flexGrow: 1, ...item.textSx }}>{item.label}</Box>
    {item.extra}
    {item.children?.length ? arrowIcon : null}
  </Stack>
);

export default MenuItemContent;
