import { FloatingPopover } from "../../../../components/FloatingPopover"
import { FlowChartIcon } from "../../../../components/Icons"
import { Box, Button, Stack, TextField } from "@mui/material"
import { NodeViewWrapper } from "@tiptap/react"
import React, { useState } from "react"
import { FlowAttributes } from "."

type InsertFlowProps = {
  updateAttributes: (attrs: FlowAttributes) => void
}

const InsertFlow = ({
  updateAttributes,
}: InsertFlowProps) => {
  const [editCode, setEditCode] = useState('')
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)

  const handleShowPopover = (event: React.MouseEvent<HTMLDivElement>) => setAnchorEl(event.currentTarget)
  const handleClosePopover = () => setAnchorEl(null)

  const handleInsertFlow = () => {
    const trimmedCode = editCode.trim()
    if (!trimmedCode) return

    updateAttributes({
      code: trimmedCode,
      width: '100%',
    })
    handleClosePopover()
  }

  return (
    <NodeViewWrapper
      className="flow-wrapper"
      data-drag-handle
    >
      <Stack
        direction={'row'}
        alignItems={'center'}
        gap={2}
        onClick={handleShowPopover}
        sx={{
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 'var(--mui-shape-borderRadius)',
          px: 2,
          py: 1.5,
          minWidth: 200,
          textAlign: 'center',
          color: 'text.secondary',
          bgcolor: 'action.default',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover'
          },
          '&:active': {
            bgcolor: 'action.selected',
          },
        }}
      >
        <FlowChartIcon sx={{ fontSize: '1rem', position: 'relative', flexShrink: 0 }} />
        <Box sx={{ fontSize: '0.875rem', position: 'relative', flexGrow: 1, textAlign: 'left' }}>
          点击此处输入或粘贴 Mermaid 流程图代码
        </Box>
      </Stack>
      <FloatingPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        placement="bottom"
      >
        <Stack gap={2} sx={{ p: 2, width: 600 }}>
          <TextField
            fullWidth
            multiline
            rows={12}
            value={editCode}
            onChange={(e) => setEditCode(e.target.value)}
            placeholder="输入 Mermaid 流程图代码"
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              }
            }}
          />
          <Button variant="contained" fullWidth onClick={handleInsertFlow}>
            提交
          </Button>
        </Stack>
      </FloatingPopover>
    </NodeViewWrapper>
  )
}

export default InsertFlow
