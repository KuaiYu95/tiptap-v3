import { Box, MenuItem, Select, Stack } from "@mui/material";
import { Editor } from "@tiptap/react";
import React, { useEffect, useState } from "react";
import { ArrowDownSLineIcon } from "../Icons";
import ToolbarItem from "./Item";


interface EditorFontSizeProps {
  editor: Editor
}

const EditorFontSize = ({ editor }: EditorFontSizeProps) => {
  const defaultFontSize = '16';
  const [selectedValue, setSelectedValue] = useState<string>(defaultFontSize);
  const Options = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60].map(it => it.toString());

  const updateFontSize = () => {
    const attrs = editor.getAttributes('textStyle');
    let fontSize = attrs.fontSize?.replace('px', '').replace('pt', '') || '';
    if (fontSize.length > 0 && attrs.fontSize?.includes('pt')) {
      fontSize = fontSize * 4 / 3
    }

    if (fontSize && Options.includes(fontSize)) {
      setSelectedValue(fontSize);
      return;
    }

    if (editor.isActive('heading')) {
      const headingAttrs = editor.getAttributes('heading');
      const headingLevel = headingAttrs.level;

      switch (headingLevel) {
        case 1: fontSize = '26'; break;
        case 2: fontSize = '22'; break;
        case 3: fontSize = '20'; break;
        case 4: fontSize = '18'; break;
        case 5: fontSize = '18'; break;
        case 6: fontSize = '16'; break;
        default: fontSize = defaultFontSize;
      }
    } else {
      fontSize = defaultFontSize;
    }
    setSelectedValue(fontSize);
  };

  const handleChange = (e: { target: { value: string } }) => {
    const value = e.target.value;
    setSelectedValue(value);
    editor.chain().focus().setFontSize(`${value}px`).run();
  }

  useEffect(() => {
    editor.on('selectionUpdate', updateFontSize);
    editor.on('transaction', updateFontSize);
    return () => {
      editor.off('selectionUpdate', updateFontSize);
      editor.off('transaction', updateFontSize);
    };
  }, [editor]);

  return <Select
    value={selectedValue}
    onChange={handleChange}
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
    renderValue={(value) => {
      return <ToolbarItem
        tip={'文字大小'}
        icon={<Stack direction={'row'} alignItems={'center'} sx={{ mr: 0.5, width: '1.5rem' }}>
          <Box sx={{ width: '1rem', textAlign: 'center', lineHeight: 1 }}>{value}</Box>
        </Stack>}
      />
    }}
    IconComponent={({ className, ...rest }) => {
      return <ArrowDownSLineIcon
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
          pointerEvents: 'none'
        }}
        {...rest}
      />
    }}
    MenuProps={{
      PaperProps: {
        sx: {
          width: 80,
          maxHeight: '300px',
        }
      }
    }}
  >
    {Options.map(it => <MenuItem key={it} value={it}>
      <Box sx={{ textAlign: 'center', fontSize: '0.875rem', width: '100%' }}>{it}</Box>
    </MenuItem>)}
  </Select>
};

export default EditorFontSize;