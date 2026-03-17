import { ActionDropdown, HoverPopover } from "../../../../components"
import { CopyIcon, EditLineIcon, LinkUnlinkIcon } from "../../../../components/Icons"
import { ToolbarItem } from "../../../../components/Toolbar"
import { Box, Divider, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Stack, TextField } from "@mui/material"
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react"
import React, { useCallback, useEffect, useState } from "react"
import { EditPopoverActions, EditPopoverShell, useAnchoredPopover } from "../shared/edit-popover"
import InsertLink from "./Insert"
import { LinkContent } from "./LinkContent"
import { buildLinkNodeAttrs, LINK_DISPLAY_OPTIONS, LinkAttributes, LinkDisplayType, replaceLinkNodeAtPos } from "./shared"

const LinkViewWrapper: React.FC<NodeViewProps> = ({
  editor,
  node,
  updateAttributes,
  deleteNode,
  selected,
  getPos,
}) => {
  const isMarkdown = editor.options.contentType === 'markdown'
  const attrs = node.attrs as LinkAttributes
  const [title, setTitle] = useState(attrs.title || '')
  const [href, setHref] = useState(attrs.href || '')
  const [type, setType] = useState(attrs.type || 'icon')
  const [target, setTarget] = useState(attrs.target || '_blank')
  const linkContentRef = React.useRef<HTMLDivElement>(null)
  const { anchorEl, isOpen, openFromElement, close } = useAnchoredPopover<HTMLDivElement>()

  useEffect(() => {
    setTitle(attrs.title || '')
    setHref(attrs.href || '')
    setType(attrs.type || 'icon')
    setTarget(attrs.target || '_blank')
  }, [attrs.title, attrs.href, attrs.type, attrs.target])

  const handleShowPopover = () => {
    openFromElement(linkContentRef.current)
  }
  const handleClosePopover = () => close()

  const handleConvertLinkType = (newType: LinkDisplayType) => {
    if (type === 'block') {
      const pos = getPos()
      if (typeof pos === 'number') {
        replaceLinkNodeAtPos({
          editor,
          pos,
          nodeSize: node.nodeSize,
          nodeType: 'inlineLink',
          attrs: buildLinkNodeAttrs(attrs, { type: newType }),
        })
      }
    } else {
      updateAttributes({
        type: newType,
      })
    }
  }

  const renderOperationActions = () => (
    <Stack
      direction={'row'}
      alignItems={'center'}
      sx={{ p: 0.5 }}
    >
      <Box className="text-ellipsis" sx={{ fontSize: '0.875rem', color: 'text.secondary', flexShrink: 0, px: 1, width: 200 }}>
        {attrs.href}
      </Box>
      <ToolbarItem
        icon={<EditLineIcon sx={{ fontSize: '1rem' }} />}
        tip='编辑'
        onClick={handleShowPopover}
      />
      <ToolbarItem
        icon={<CopyIcon sx={{ fontSize: '1rem' }} />}
        tip='复制链接'
        onClick={handleCopyLink}
      />
      <ToolbarItem
        icon={<LinkUnlinkIcon sx={{ fontSize: '1rem' }} />}
        tip='取消链接'
        onClick={handleDeleteLink}
      />
      {!isMarkdown && <>
        <Divider orientation='vertical' flexItem sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }} />
        <ActionDropdown
          id='link-type-dropdown'
          selected={type}
          list={LINK_DISPLAY_OPTIONS.map((option) => ({
            key: option.key,
            label: option.label,
            icon: option.icon,
            onClick: () => {
              if (option.key === 'block') {
                const pos = getPos()
                if (typeof pos === 'number') {
                  replaceLinkNodeAtPos({
                    editor,
                    pos,
                    nodeSize: node.nodeSize,
                    nodeType: 'blockLink',
                    attrs: buildLinkNodeAttrs(attrs, { type: 'block' }),
                  })
                }
                return
              }

              handleConvertLinkType(option.key)
            },
          }))}
        />
      </>}
    </Stack>
  )

  const handleSave = () => {
    if (type === 'block') {
      const pos = getPos()
      if (typeof pos === 'number') {
        replaceLinkNodeAtPos({
          editor,
          pos,
          nodeSize: node.nodeSize,
          nodeType: 'blockLink',
          attrs: buildLinkNodeAttrs(attrs, {
            title,
            href,
            type,
            target,
          }),
        })
      }
    } else {
      updateAttributes?.({
        title,
        href,
        type,
        target,
      })
    }
    handleClosePopover()
  }

  const handleDeleteLink = () => {
    // 获取当前节点位置，确保在正确位置插入文本
    const pos = getPos()
    if (typeof pos === 'number') {
      editor.chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .insertContentAt(pos, attrs.title || attrs.href)
        .run()
    }
  }

  const handleCopyLink = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(attrs.href);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, [attrs.href]);

  if (!attrs.href && !editor.isEditable) {
    return null
  }

  if (!editor.isEditable) {
    return <NodeViewWrapper
      className={`link-wrapper`}
    >
      <LinkContent attrs={attrs} editable={false} />
    </NodeViewWrapper>
  }

  if (!attrs.href) {
    return <InsertLink
      updateAttributes={updateAttributes}
      deleteNode={deleteNode}
      selected={selected}
      attrs={attrs}
      editor={editor}
    />
  }

  return <NodeViewWrapper
    className={`link-wrapper ${attrs.class} ${attrs.type === 'block' ? 'block-link-wrapper' : ''} ${selected ? 'ProseMirror-selectednode' : ''}`}
    as={attrs.type === 'block' ? 'div' : 'span'}
    {...(attrs.type === 'block' ? { 'data-drag-handle': true } : {})}
  >
    <div ref={linkContentRef}>
      <HoverPopover
        actions={renderOperationActions()}
        hoverDelay={500}
        placement="top"
      >
        <LinkContent attrs={attrs} editable={true} />
      </HoverPopover>
    </div>
    <EditPopoverShell
      open={isOpen}
      anchorEl={anchorEl}
      onClose={handleClosePopover}
    >
      <Stack gap={2} sx={{
        p: 2,
        width: 350,
        '.MuiFormControlLabel-label': {
          fontSize: '0.875rem'
        }
      }}>
        <Stack direction={'row'} gap={2} alignItems={'center'}>
          <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', flexShrink: 0 }}>地址</Box>
          <TextField
            fullWidth
            size="small"
            value={href}
            onChange={(e) => setHref(e.target.value)}
            placeholder="https://example.com"
            required
            error={href.length > 0 && !href.trim()}
            helperText={href.length > 0 && !href.trim() ? "请输入有效的链接地址" : ""}
          />
        </Stack>
        <Stack direction={'row'} gap={2} alignItems={'center'}>
          <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', flexShrink: 0 }}>标题</Box>
          <TextField
            fullWidth
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="链接标题（可选）"
          />
        </Stack>
        {!isMarkdown && <>
          <FormControl component="fieldset">
            <Stack direction={'row'} gap={2} alignItems={'center'}>
              <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>风格</FormLabel>
              <RadioGroup
                row
                value={type}
                onChange={(e) => setType(e.target.value as LinkDisplayType)}
              >
                {LINK_DISPLAY_OPTIONS.map((option) => (
                  <FormControlLabel
                    key={option.key}
                    value={option.key}
                    control={<Radio size="small" />}
                    label={option.label}
                  />
                ))}
              </RadioGroup>
            </Stack>
          </FormControl>
          <FormControl component="fieldset">
            <Stack direction={'row'} gap={2} alignItems={'flex-start'} sx={{
              '.MuiFormControlLabel-label': {
                fontSize: '0.875rem'
              }
            }}>
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', flexShrink: 0 }}>打开</FormLabel>
              <RadioGroup
                row
                value={target}
                onChange={(e) => setTarget(e.target.value as '_blank' | '_self' | '_parent' | '_top')}
              >
                <FormControlLabel
                  value="_blank"
                  control={<Radio size="small" />}
                  label="新窗口"
                />
                <FormControlLabel
                  value="_self"
                  control={<Radio size="small" />}
                  label="当前窗口"
                />
              </RadioGroup>
            </Stack>
          </FormControl>
        </>}
        <EditPopoverActions
          onCancel={handleClosePopover}
          onConfirm={handleSave}
          confirmText="修改链接"
          confirmDisabled={!href.trim()}
        />
      </Stack>
    </EditPopoverShell>
  </NodeViewWrapper>
}

export default LinkViewWrapper
