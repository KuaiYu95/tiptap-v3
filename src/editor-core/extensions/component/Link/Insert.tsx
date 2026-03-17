import { LinkIcon } from "../../../../components/Icons"
import { Box, Button, Stack } from "@mui/material"
import { Editor } from "@tiptap/core"
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react"
import React, { useEffect, useState } from "react"
import { InsertPopover, InsertTriggerCard, useInsertPopover } from "../shared/insert-popover"
import { ResourceRadioField, ResourceTextField } from "../shared/resource-form"
import { LINK_DISPLAY_OPTIONS, LinkAttributes, LinkDisplayType } from "./shared"

interface InsertLinkProps extends Partial<NodeViewProps> {
  attrs: LinkAttributes
  editor: Editor
}

const InsertLink = ({ updateAttributes, deleteNode, attrs, editor }: InsertLinkProps) => {
  const isMarkdown = editor.options.contentType === 'markdown'
  const [title, setTitle] = useState(attrs.title || '')
  const [href, setHref] = useState(attrs.href || '')
  const [type, setType] = useState(attrs.type || 'icon')
  const [target, setTarget] = useState(attrs.target || '_blank')
  const {
    anchorEl,
    triggerRef,
    openFromEvent,
    openFromTrigger,
    close,
    isOpen,
  } = useInsertPopover<HTMLDivElement>()

  const handleSave = () => {
    if (type === 'block') {
      editor.commands.setBlockLink({
        title,
        href,
        type,
        target,
      })
    } else {
      updateAttributes?.({
        title,
        href,
        type,
        target,
      })
    }
  }

  const handleDeleteLink = () => {
    deleteNode?.()
    editor.commands.insertContent(attrs.title)
  }

  useEffect(() => {
    if (!attrs.href && attrs.title && !isOpen) {
      setTimeout(() => {
        openFromTrigger()
      }, 100)
    }
  }, [attrs.href, attrs.title, isOpen, openFromTrigger])

  return <NodeViewWrapper
    className={`link-wrapper ${attrs.class}`}
    as={'span'}
  >
    <InsertTriggerCard
      ref={triggerRef}
      icon={<LinkIcon sx={{ fontSize: '1rem', flexShrink: 0 }} />}
      text={<Box component={'span'}>添加{title ? `“${title}”` : ''}链接</Box>}
      onClick={openFromEvent}
      minWidth={0}
    />
    <InsertPopover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={close}
    >
      <Stack gap={2} sx={{ p: 2, width: 350 }}>
        <ResourceTextField
          label="地址"
          textFieldProps={{
            value: href,
            onChange: (e) => setHref(e.target.value),
            placeholder: "https://example.com",
            required: true,
            error: href.length > 0 && !href.trim(),
            helperText: href.length > 0 && !href.trim() ? "请输入有效的链接地址" : "",
          }}
        />
        <ResourceTextField
          label="标题"
          textFieldProps={{
            value: title,
            onChange: (e) => setTitle(e.target.value),
            placeholder: "链接标题（可选）",
          }}
        />
        {!isMarkdown && <>
          <ResourceRadioField
            label="风格"
            value={type}
            onChange={(value) => setType(value as LinkDisplayType)}
            options={LINK_DISPLAY_OPTIONS.map((option) => ({
              value: option.key,
              label: option.label,
            }))}
          />
          <ResourceRadioField
            label="打开"
            value={target}
            onChange={(value) => setTarget(value as '_blank' | '_self' | '_parent' | '_top')}
            options={[
              { value: '_blank', label: '新窗口' },
              { value: '_self', label: '当前窗口' },
            ]}
          />
        </>}
      <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={handleDeleteLink}
          >
            取消链接
          </Button>
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={() => {
              handleSave()
              close()
            }}
            disabled={!href.trim()}
          >
            插入链接
          </Button>
        </Stack>
      </Stack>
    </InsertPopover>
  </NodeViewWrapper>
}

export default InsertLink
