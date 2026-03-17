import { Box, Button, Stack, TextField, useTheme } from "@mui/material";
import { Editor } from "@tiptap/react";
import React, { useEffect, useState } from "react";
import { HexAlphaColorPicker } from "react-colorful";
import FloatingPopover from "../FloatingPopover";
import { ArrowDownSLineIcon, MarkupLineIcon } from "../Icons";
import ToolbarItem from "./Item";

interface EditorFontBgColorProps {
  editor: Editor
}

const EditorFontBgColor = ({ editor }: EditorFontBgColorProps) => {
  const theme = useTheme()
  const defaultColor = theme.palette.background.paper

  const THEME_TEXT_BG_COLOR = [
    '#e7bdff',
    '#FFE0B2',
    '#F8BBD0',
    '#F0ECB3',
    '#FFCCBC',
    '#B3E5FC',
    '#C8E6C9',
    '#B2EBF2',
    '#BBDEFB',
    '#DCEDC8',
  ]

  const [color, setColor] = useState<string>(defaultColor);
  const [customColor, setCustomColor] = useState<string>(defaultColor)
  const [modifyColor, setModifyColor] = useState<boolean>(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const handleClosePopover = () => setAnchorEl(null)
  const handleShowPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (anchorEl) {
      handleClosePopover()
    } else {
      setAnchorEl(event.currentTarget)
    }
  }

  const updateColor = () => {
    const attrs = editor.getAttributes('textStyle');
    setCustomColor(attrs.backgroundColor || defaultColor);
  }

  const checkModifyColor = (color: string) => {
    if (color.startsWith('#')) {
      const colorValue = color.slice(1)
      if (/^[0-9A-Fa-f]{6}$/.test(colorValue)
        || /^[0-9A-Fa-f]{8}$/.test(colorValue)
        || /^[0-9A-Fa-f]{3}$/.test(colorValue)
      ) {
        return true
      }
    }
    return false
  }

  useEffect(() => {
    editor.on('selectionUpdate', updateColor);
    editor.on('transaction', updateColor);
    return () => {
      editor.off('selectionUpdate', updateColor);
      editor.off('transaction', updateColor);
    };
  }, [editor]);

  return <>
    <Stack sx={{ position: 'relative' }}>
      <ToolbarItem
        tip={'文字背景颜色'}
        icon={<MarkupLineIcon sx={{ fontSize: '1rem' }} />}
        sx={{ position: 'relative', minWidth: '44px', justifyContent: 'flex-start' }}
        onClick={() => {
          editor.chain().focus().setBackgroundColor(color).run()
          handleClosePopover()
        }}
      />
      <Box sx={{
        width: '0.8rem',
        height: '2px',
        borderRadius: '2px',
        position: 'absolute',
        left: 'calc(var(--mui-spacing-unit) + 0.1rem)',
        bottom: 'calc(var(--mui-spacing-unit) + 1px)',
        p: '0px !important',
        minWidth: '0px !important',
        zIndex: 1,
        bgcolor: color,
      }}>
      </Box>
      <Button onClick={handleShowPopover} sx={{
        position: 'absolute',
        right: 'calc(var(--mui-spacing-unit) / 2)',
        p: '0px !important',
        width: '1rem',
        minWidth: '0px !important',
        height: '100%',
        zIndex: 1,
      }}>
        <ArrowDownSLineIcon sx={{
          fontSize: '1rem',
          color: 'text.disabled',
          transform: anchorEl ? 'rotate(-180deg)' : 'none',
          transition: 'transform 0.3s',
          cursor: 'pointer',
          pointerEvents: 'none'
        }} />
      </Button>
    </Stack>
    <FloatingPopover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleClosePopover}
      placement="bottom"
    >
      <Box sx={{
        p: 1,
        fontSize: '0.875rem',
      }}>
        <Stack direction={'row'} alignItems={'center'} gap={1} sx={{ mb: 1 }}>
          <Box sx={{
            width: '1.5rem',
            height: '1.5rem',
            border: '1px solid',
            borderColor: 'divider',
            boxSizing: 'border-box',
            borderRadius: 'var(--mui-shape-borderRadius)',
            bgcolor: defaultColor,
            cursor: 'pointer',
          }} onClick={() => {
            editor.chain().focus().setBackgroundColor('').run()
            handleClosePopover()
          }} />
          <Box>默认</Box>
        </Stack>
        <Stack direction={'row'} flexWrap={'wrap'} gap={1}>
          {THEME_TEXT_BG_COLOR.map((c) => (
            <Box key={c} sx={{
              width: '1.5rem',
              height: '1.5rem',
              cursor: 'pointer',
              borderRadius: 'var(--mui-shape-borderRadius)',
              bgcolor: c,
            }} onClick={() => {
              setColor(c)
              editor.chain().focus().setBackgroundColor(c).run()
              handleClosePopover()
            }} />
          ))}
        </Stack>
        <Box sx={{
          mt: 1,
          '.react-colorful': { width: '100%', height: 150 },
          '.react-colorful__pointer': { width: 16, height: 16 },
          '.react-colorful__alpha, .react-colorful__hue': { height: '16px !important' }
        }}>
          <HexAlphaColorPicker color={customColor} onChange={setCustomColor} />
          <Stack direction="row" alignItems="center" sx={{ mt: 1 }} justifyContent="space-between">
            {!modifyColor ? <Box
              onClick={() => setModifyColor(true)}
              sx={{ fontSize: 14, color: 'text.secondary', fontFamily: 'monospace', cursor: 'text' }}
            >
              {customColor}
            </Box> : <TextField
              value={customColor}
              size='small'
              autoFocus
              onChange={(e) => setCustomColor(e.target.value)}
              onBlur={() => {
                if (!checkModifyColor(customColor)) {
                  setCustomColor(defaultColor)
                }
                editor.chain().focus().setBackgroundColor(customColor).run()
                setModifyColor(false)
              }}
              slotProps={{
                input: {
                  sx: {
                    fontSize: 14,
                    color: 'text.secondary',
                    fontFamily: 'monospace',
                    width: 200,
                  }
                }
              }}
            />}
            <Button
              size="small"
              variant="outlined"
              disabled={!checkModifyColor(customColor)}
              sx={{ p: '0px !important' }}
              onClick={() => {
                setColor(customColor)
                editor.chain().focus().setBackgroundColor(customColor).run()
                setModifyColor(false)
                handleClosePopover()
              }}
            >
              确定
            </Button>
          </Stack>
        </Box>
      </Box>
    </FloatingPopover>
  </>
};

export default EditorFontBgColor;