import { FloatingPopover } from "../../../../components/FloatingPopover"
import { Button, Stack, TextField } from "@mui/material"
import React, { useEffect, useState } from "react"
import { FlowAttributes } from "."

type EditFlowProps = {
  anchorEl: HTMLElement | null
  attrs: FlowAttributes
  updateAttributes: (attrs: FlowAttributes) => void
  onCancel: () => void
}

const EditFlow = ({
  anchorEl,
  attrs,
  updateAttributes,
  onCancel,
}: EditFlowProps) => {
  const [editCode, setEditCode] = useState(attrs.code || '')

  useEffect(() => {
    setEditCode(attrs.code || '')
  }, [attrs.code])

  const handleSaveFlow = () => {
    const trimmedCode = editCode.trim()
    if (!trimmedCode) return

    updateAttributes({
      code: trimmedCode,
    })
    onCancel()
  }

  return (
    <FloatingPopover
      open={true}
      anchorEl={anchorEl}
      onClose={onCancel}
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
        <Stack direction="row" gap={1}>
          <Button variant="outlined" fullWidth onClick={onCancel}>
            取消
          </Button>
          <Button variant="contained" fullWidth onClick={handleSaveFlow}>
            保存
          </Button>
        </Stack>
      </Stack>
    </FloatingPopover>
  )
}

export default EditFlow
