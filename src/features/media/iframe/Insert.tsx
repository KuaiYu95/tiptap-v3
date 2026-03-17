import { IframeTypeEnums } from "../../../constants/enums"
import { EditorFnProps } from "../../../types"
import { extractSrcFromIframe, normalizeBilibiliAutoplay } from "../../../utils"
import { Button, Stack, TextField } from "@mui/material"
import { NodeViewWrapper } from "@tiptap/react"
import React, { useState } from "react"
import { InsertPopover, InsertTriggerCard, useInsertPopover } from "../../../editor-core/extensions/component/shared/insert-popover"

export type IframeAttributes = {
  src: string
  width: number | string
  height: number
  align: 'left' | 'center' | 'right' | null
  type: 'iframe' | 'bilibili'
}

type InsertIframeProps = {
  selected: boolean
  attrs: IframeAttributes
  updateAttributes: (attrs: IframeAttributes) => void
} & EditorFnProps

const InsertIframe = ({ attrs, updateAttributes, onValidateUrl }: InsertIframeProps) => {
  const [editUrl, setEditUrl] = useState(attrs.src ?? '')
  const { anchorEl, triggerRef, openFromEvent, close, isOpen } = useInsertPopover<HTMLDivElement>()

  const handleInsert = async () => {
    if (!editUrl.trim()) return
    try {
      let validatedUrl = extractSrcFromIframe(editUrl)
      if (onValidateUrl) {
        validatedUrl = await Promise.resolve(onValidateUrl(validatedUrl, 'iframe'))
      }
      if (attrs.type === 'bilibili') {
        validatedUrl = normalizeBilibiliAutoplay(validatedUrl)
      }
      updateAttributes({
        src: validatedUrl,
        width: attrs.width,
        height: attrs.height,
        align: attrs.align,
        type: attrs.type,
      })
      close()
    } catch (error) {
    }
  }

  return <NodeViewWrapper className={`iframe-wrapper`} data-drag-handle>
    <InsertTriggerCard
      ref={triggerRef}
      icon={IframeTypeEnums[attrs.type].icon}
      text={`点击此处嵌入 ${IframeTypeEnums[attrs.type].label}`}
      onClick={openFromEvent}
      dragHandle
    />
    <InsertPopover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={close}
    >
      <Stack gap={2} sx={{ p: 2, width: 350 }}>
        <TextField
          fullWidth
          multiline
          rows={5}
          size="small"
          value={editUrl}
          onChange={(e) => setEditUrl(e.target.value)}
          placeholder={`输入/粘贴要嵌入的 URL`}
        />
        <Stack direction={'row'} gap={1}>
          <Button variant="outlined" fullWidth onClick={close}>取消</Button>
          <Button variant="contained" fullWidth onClick={handleInsert}>嵌入</Button>
        </Stack>
      </Stack>
    </InsertPopover>
  </NodeViewWrapper>
}

export default InsertIframe
