import { Divider } from '@mui/material';
import React from 'react';
import { ToolbarItem } from '../../components/Toolbar';

interface ToolListItem {
  id: string;
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface MarkdownToolbarToolListProps {
  items: ToolListItem[];
}

const MarkdownToolbarToolList = ({ items }: MarkdownToolbarToolListProps) => (
  <>
    {items.map((item) => (
      item.id.includes('divider') ? (
        <Divider
          key={item.id}
          sx={{ mx: 0.5, height: 20, alignSelf: 'center' }}
          orientation="vertical"
          flexItem
        />
      ) : (
        <ToolbarItem
          key={item.id}
          tip={item.label}
          icon={item.icon}
          onClick={item.onClick}
        />
      )
    ))}
  </>
);

export default MarkdownToolbarToolList;
