import { getShortcutKeyText } from "../../utils"
import { Box, Typography } from "@mui/material"
import { Editor } from "@tiptap/react"
import React, { useEffect, useState } from "react"
import { ArrowDownSLineIcon, H1Icon, H2Icon, H3Icon, H4Icon, H5Icon, H6Icon, TextIcon } from "../Icons"
import Menu from "../Menu"
import { default as ToolbarItem } from "./Item"

interface EditorHeadingProps {
  editor: Editor
}

const EditorHeading = ({ editor }: EditorHeadingProps) => {
  const [selectedValue, setSelectedValue] = useState<string>("paragraph");
  const HeadingOptions = [
    { id: 'paragraph', icon: <TextIcon sx={{ fontSize: '1rem' }} />, label: '正文', shortcutKey: ['ctrl', 'alt', '0'] },
    { id: '1', icon: <H1Icon sx={{ fontSize: '1rem' }} />, label: '标题1', shortcutKey: ['ctrl', 'alt', '1'] },
    { id: '2', icon: <H2Icon sx={{ fontSize: '1rem' }} />, label: '标题2', shortcutKey: ['ctrl', 'alt', '2'] },
    { id: '3', icon: <H3Icon sx={{ fontSize: '1rem' }} />, label: '标题3', shortcutKey: ['ctrl', 'alt', '3'] },
    { id: '4', icon: <H4Icon sx={{ fontSize: '1rem' }} />, label: '标题4', shortcutKey: ['ctrl', 'alt', '4'] },
    { id: '5', icon: <H5Icon sx={{ fontSize: '1rem' }} />, label: '标题5', shortcutKey: ['ctrl', 'alt', '5'] },
    { id: '6', icon: <H6Icon sx={{ fontSize: '1rem' }} />, label: '标题6', shortcutKey: ['ctrl', 'alt', '6'] },
  ]

  const updateSelection = () => {
    const level = editor.getAttributes("heading").level || "paragraph";
    setSelectedValue(level);
  }

  const handleChange = (value: string) => {
    setSelectedValue(value);
    if (value !== 'paragraph') {
      const level = parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6;
      editor.chain().focus().toggleHeading({ level }).run();
    } else {
      editor.chain().focus().setParagraph().run();
    }
  }

  useEffect(() => {
    editor.on('selectionUpdate', updateSelection);
    editor.on('transaction', updateSelection);
    return () => {
      editor.off('selectionUpdate', updateSelection);
      editor.off('transaction', updateSelection);
    };
  }, [editor]);

  return <Menu
    context={<ToolbarItem
      tip={'标题'}
      text={<Box sx={{ position: 'relative', pr: 1 }}>
        <Box sx={{ width: '38px', textAlign: 'left' }}>{HeadingOptions.filter(it => it.id === String(selectedValue))[0].label}</Box>
        <ArrowDownSLineIcon
          sx={{
            position: 'absolute',
            right: -2,
            top: '50%',
            transform: 'translateY(-50%)',
            flexSelf: 'center',
            fontSize: '1rem',
            flexShrink: 0,
            mr: 0,
            color: 'text.disabled',
            cursor: 'pointer',
            pointerEvents: 'none'
          }}
        />
      </Box>}
    />}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    arrowIcon={<ArrowDownSLineIcon sx={{ fontSize: '1rem', transform: 'rotate(-90deg)' }} />}
    list={[
      ...HeadingOptions.map(it => ({
        label: it.label,
        key: it.id,
        icon: it.icon,
        extra: <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>{getShortcutKeyText(it.shortcutKey, '+')}</Typography>,
        onClick: () => handleChange(it.id),
      })),
    ]}
  />
}

export default EditorHeading
