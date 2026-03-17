import { Stack, TextField } from "@mui/material"
import { TextSelection } from "@tiptap/pm/state"
import { Editor } from "@tiptap/react"
import React, { useEffect, useState } from "react"
import { EditPopoverActions, EditPopoverShell } from "../shared/edit-popover"

interface EditPopoverProps {
  open: boolean
  editor: Editor
  text: string
  anchorEl: HTMLElement | null
  onClose: () => void
}

const EditPopover = ({
  open,
  editor,
  text,
  anchorEl,
  onClose,
}: EditPopoverProps) => {
  const isEditable = editor.isEditable
  const [tooltipText, setTooltipText] = useState(text || '')

  const onConfirm = (tooltipText: string) => {
    if (!anchorEl) {
      onClose()
      return
    }

    // 通过 DOM 元素找到文档位置
    const view = editor.view
    const domPos = view.posAtDOM(anchorEl, 0)
    if (domPos === null || domPos === undefined) {
      onClose()
      return
    }

    // 找到包含该 mark 的完整范围
    const { state } = editor
    const { doc } = state
    const tooltipMarkType = editor.schema.marks.tooltip

    if (!tooltipMarkType) {
      onClose()
      return
    }

    // 遍历文档找到所有包含该 mark 的文本节点，并确定连续范围
    let markFrom: number | null = null
    let markTo: number | null = null

    doc.nodesBetween(0, doc.content.size, (node, pos) => {
      if (node.isText && node.marks.some(m => m.type === tooltipMarkType && m.attrs.tooltip === text)) {
        // 检查是否在 domPos 附近（包含 domPos 的节点）
        if (pos <= domPos && domPos < pos + node.nodeSize) {
          if (markFrom === null) {
            markFrom = pos
          }
          markTo = pos + node.nodeSize
        }
      }
    })

    // 如果找到了包含 domPos 的节点，扩展范围以包含所有连续的相同 mark
    if (markFrom !== null && markTo !== null) {
      // 向前扩展
      while (markFrom > 0) {
        const $pos = doc.resolve(markFrom - 1)
        const node = $pos.nodeAfter
        if (node && node.isText && node.marks.some(m => m.type === tooltipMarkType && m.attrs.tooltip === text)) {
          markFrom = markFrom - 1
        } else {
          break
        }
      }
      // 向后扩展
      while (markTo < doc.content.size) {
        const $pos = doc.resolve(markTo)
        const node = $pos.nodeAfter
        if (node && node.isText && node.marks.some(m => m.type === tooltipMarkType && m.attrs.tooltip === text)) {
          markTo = markTo + node.nodeSize
        } else {
          break
        }
      }
    }

    if (markFrom !== null && markTo !== null && markFrom < markTo) {
      // 选中该范围并应用 tooltip
      const tr = state.tr
      const selection = TextSelection.create(tr.doc, markFrom, markTo)
      tr.setSelection(selection)

      if (tooltipText) {
        tr.addMark(markFrom, markTo, tooltipMarkType.create({ tooltip: tooltipText }))
      } else {
        tr.removeMark(markFrom, markTo, tooltipMarkType)
      }

      view.dispatch(tr)
      editor.commands.focus()
    } else {
      // 如果找不到范围，使用原来的方法
      if (tooltipText) {
        editor.chain().focus().setTooltip(tooltipText).run()
      } else {
        editor.chain().focus().unsetTooltip().run()
      }
    }

    onClose()
  }

  useEffect(() => {
    if (isEditable) setTooltipText(text || '')
  }, [text])

  if (!isEditable) {
    return null
  }

  return <EditPopoverShell
    open={open}
    anchorEl={anchorEl}
    onClose={onClose}
  >
    <Stack gap={2} sx={{ p: 2, width: 350 }}>
      <TextField
        fullWidth
        size="small"
        multiline
        rows={4}
        value={tooltipText}
        onChange={(e) => setTooltipText(e.target.value)}
        placeholder="输入鼠标悬停时显示的提示文本"
        required
        autoFocus
        error={tooltipText.length > 0 && !tooltipText.trim()}
        helperText={tooltipText.length > 0 && !tooltipText.trim() ? "请输入有效的提示文本" : ""}
      />
      <EditPopoverActions
        onCancel={onClose}
        onConfirm={() => onConfirm(tooltipText.trim())}
        confirmText={tooltipText.trim() ? '应用' : '移除'}
        confirmDisabled={!tooltipText.trim() && !text}
      />
    </Stack>
  </EditPopoverShell>
}

export default EditPopover
