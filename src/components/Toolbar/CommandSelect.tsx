import { getShortcutKeyText } from '../../utils';
import { Box, MenuItem, Select, Stack, Tooltip } from '@mui/material';
import { Editor } from '@tiptap/react';
import React from 'react';
import { ArrowDownSLineIcon } from '../Icons';
import ToolbarItem from './Item';

export interface CommandSelectOption {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortcutKey?: string[];
}

interface EditorCommandSelectProps {
  editor: Editor;
  value: string;
  activeValues: string[];
  options: CommandSelectOption[];
  tip: string;
  fallbackIcon: React.ReactNode;
  onSelect: (value: string) => void;
}

export const useEditorSelectValue = (
  editor: Editor,
  getValue: () => string,
) => {
  const [selectedValue, setSelectedValue] = React.useState<string>(getValue);

  React.useEffect(() => {
    const updateSelection = () => {
      setSelectedValue(getValue());
    };

    updateSelection();
    editor.on('selectionUpdate', updateSelection);
    editor.on('transaction', updateSelection);

    return () => {
      editor.off('selectionUpdate', updateSelection);
      editor.off('transaction', updateSelection);
    };
  }, [editor, getValue]);

  return selectedValue;
};

const EditorCommandSelect = ({
  value,
  activeValues,
  options,
  tip,
  fallbackIcon,
  onSelect,
}: EditorCommandSelectProps) => {
  return (
    <Select
      value={value}
      className={activeValues.includes(value) ? 'tool-active' : ''}
      onChange={() => {
        // Commands are executed from MenuItem clicks to avoid double-triggering
        // toggle-style actions such as list and code commands.
      }}
      sx={{
        bgcolor: 'transparent',
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderWidth: '0px !important',
          borderColor: 'transparent !important',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderWidth: '0px !important',
          borderColor: 'transparent !important',
        },
      }}
      renderValue={(selected) => (
        <ToolbarItem
          tip={tip}
          icon={
            <Stack direction="row" alignItems="center" sx={{ mr: 0.5, width: '1.5rem' }}>
              {options.find((option) => option.id === selected)?.icon || fallbackIcon}
            </Stack>
          }
        />
      )}
      IconComponent={({ className, ...rest }) => (
        <ArrowDownSLineIcon
          sx={{
            position: 'absolute',
            right: 2,
            flexSelf: 'center',
            fontSize: '1rem',
            flexShrink: 0,
            mr: 0,
            color: 'text.disabled',
            transform: className?.includes('MuiSelect-iconOpen') ? 'rotate(-180deg)' : 'none',
            transition: 'transform 0.3s',
            cursor: 'pointer',
            pointerEvents: 'none',
          }}
          {...rest}
        />
      )}
    >
      <MenuItem key="none" value="none" sx={{ display: 'none' }}>
        {fallbackIcon}
        <Box sx={{ ml: 1 }}>无</Box>
      </MenuItem>
      {options.map((option) => (
        <MenuItem
          key={option.id}
          value={option.id}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(option.id);
          }}
        >
          <Tooltip arrow title={getShortcutKeyText(option.shortcutKey || [])} placement="right">
            <Stack direction="row" alignItems="center" justifyContent="center" gap={1}>
              {option.icon}
              <Box sx={{ fontSize: '0.875rem' }}>{option.label}</Box>
            </Stack>
          </Tooltip>
        </MenuItem>
      ))}
    </Select>
  );
};

export default EditorCommandSelect;
