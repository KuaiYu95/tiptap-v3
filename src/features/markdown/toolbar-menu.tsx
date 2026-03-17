import { Box } from '@mui/material';
import React from 'react';
import { MenuItem } from '../../types';
import { AddCircleFillIcon, ArrowDownSLineIcon, Table2Icon } from '../../components/Icons';
import Menu from '../../components/Menu';
import { ToolbarItem } from '../../components/Toolbar';

interface MarkdownToolbarMenuProps {
  type: 'insert' | 'heading' | 'table';
  list: MenuItem[];
  isExpend?: boolean;
}

const menuArrowIcon = <ArrowDownSLineIcon sx={{ fontSize: '1rem', transform: 'rotate(-90deg)' }} />;

const menuProps = {
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' } as const,
  transformOrigin: { vertical: 'top', horizontal: 'left' } as const,
};

type ToolbarTriggerProps = React.ComponentProps<typeof ToolbarItem>;

const HeadingTrigger = (props: ToolbarTriggerProps) => (
  <ToolbarItem
    {...props}
    tip="标题"
    text={(
      <Box sx={{ position: 'relative', pr: 1 }}>
        <Box sx={{ width: '38px', textAlign: 'left' }}>标题</Box>
        <ArrowDownSLineIcon
          sx={{
            position: 'absolute',
            right: -6,
            top: '50%',
            transform: 'translateY(-50%)',
            flexSelf: 'center',
            fontSize: '1rem',
            flexShrink: 0,
            mr: 0,
            color: 'text.disabled',
            cursor: 'pointer',
            pointerEvents: 'none',
          }}
        />
      </Box>
    )}
  />
);

const getContext = (type: MarkdownToolbarMenuProps['type']) => {
  if (type === 'insert') {
    return (
      <ToolbarItem
        text="插入"
        icon={<AddCircleFillIcon sx={{ fontSize: '1rem' }} />}
      />
    );
  }

  if (type === 'table') {
    return (
      <ToolbarItem
        tip="表格"
        icon={<Table2Icon sx={{ fontSize: '1rem' }} />}
      />
    );
  }

  return <HeadingTrigger />;
};

const MarkdownToolbarMenu = ({ type, list, isExpend }: MarkdownToolbarMenuProps) => (
  <Menu
    context={getContext(type)}
    arrowIcon={menuArrowIcon}
    zIndex={isExpend ? 2100 : undefined}
    list={list}
    {...menuProps}
  />
);

export default MarkdownToolbarMenu;
