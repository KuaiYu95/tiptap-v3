import { ActionDropdown, FloatingPopover, HoverPopover } from "@ctzhian/tiptap/component"
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, DeleteLineIcon, EditLineIcon } from "@ctzhian/tiptap/component/Icons"
import { ToolbarItem } from "@ctzhian/tiptap/component/Toolbar"
import { EditorFnProps } from "@ctzhian/tiptap/type"
import { extractSrcFromIframe, normalizeBilibiliAutoplay } from "@ctzhian/tiptap/util"
import { alpha, Box, Button, Divider, Stack, TextField, useTheme } from "@mui/material"
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import React, { useCallback, useEffect, useRef, useState } from "react"
import InsertIframe, { IframeAttributes } from "./Insert"
import ReadonlyIframe from "./Readonly"

const IframeViewWrapper: React.FC<NodeViewProps & EditorFnProps> = ({
  editor,
  node,
  updateAttributes,
  deleteNode,
  selected,
  onValidateUrl
}) => {
  const attrs = node.attrs as IframeAttributes
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const iframeContentRef = useRef<HTMLDivElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const theme = useTheme()

  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [dragCorner, setDragCorner] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null>(null)
  const dragStartXRef = useRef(0)
  const dragStartYRef = useRef(0)
  const dragStartWidthRef = useRef(0)
  const dragStartHeightRef = useRef(0)
  const maxWidthRef = useRef(0)
  const [editSrc, setEditSrc] = useState(attrs.src ?? '')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [keepHoverPopoverOpen, setKeepHoverPopoverOpen] = useState(false)

  const handleShowPopover = () => {
    setEditSrc(attrs.src ?? '')
    setKeepHoverPopoverOpen(true)
    setAnchorEl(editButtonRef.current)
  }

  const handleClosePopover = () => {
    setAnchorEl(null)
    setKeepHoverPopoverOpen(false)
  }

  const isPercentWidth = (): boolean => {
    if (!attrs.width) return true
    if (typeof attrs.width === 'string' && attrs.width.endsWith('%')) {
      return true
    }
    return false
  }

  const getCurrentWidthPercent = (): string => {
    if (isPercentWidth()) {
      if (!attrs.width) return '100'
      if (typeof attrs.width === 'string' && attrs.width.endsWith('%')) {
        return attrs.width.replace('%', '')
      }
      return '100'
    }
    return 'pixel'
  }

  const getCurrentDisplayWidth = (): number => {
    if (!iframeRef.current) {
      return getEditorWidth()
    }
    const computedStyle = window.getComputedStyle(iframeRef.current)
    const displayWidth = iframeRef.current.offsetWidth

    if (typeof attrs.width === 'string' && attrs.width.endsWith('%')) {
      return displayWidth
    }

    if (typeof attrs.width === 'number') {
      if (computedStyle.maxWidth === '100%' && displayWidth < attrs.width) {
        return displayWidth
      }
      return attrs.width
    }
    return getEditorWidth()
  }

  const getCurrentDisplayHeight = (): number => {
    if (!iframeRef.current) {
      return typeof attrs.height === 'number' ? attrs.height : 400
    }
    return iframeRef.current.offsetHeight
  }

  const getEditorWidth = (): number => {
    if (iframeContentRef.current) {
      let current: HTMLElement | null = iframeContentRef.current
      while (current) {
        if (current.classList?.contains('node-iframe')) {
          const style = window.getComputedStyle(current)
          const paddingLeft = parseFloat(style.paddingLeft) || 0
          const paddingRight = parseFloat(style.paddingRight) || 0

          return current.clientWidth - paddingLeft - paddingRight
        }
        current = current.parentElement
      }
    }
    if (editor?.view?.dom) {
      const editorElement = editor.view.dom as HTMLElement
      const style = window.getComputedStyle(editorElement)
      const paddingLeft = parseFloat(style.paddingLeft) || 0
      const paddingRight = parseFloat(style.paddingRight) || 0
      const editorWidth = editorElement.clientWidth - paddingLeft - paddingRight
      if (editorWidth > 0) {
        return editorWidth
      }
    }
    return 800
  }

  const handleMouseDown = (e: React.MouseEvent, corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragCorner(corner)
    dragStartXRef.current = e.clientX
    dragStartYRef.current = e.clientY
    const width = getCurrentDisplayWidth()
    const height = getCurrentDisplayHeight()
    dragStartWidthRef.current = width
    dragStartHeightRef.current = height
    maxWidthRef.current = getEditorWidth()
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragCorner) return
    const deltaX = e.clientX - dragStartXRef.current
    const deltaY = e.clientY - dragStartYRef.current

    let newWidth: number
    let newHeight: number

    if (dragCorner === 'top-right' || dragCorner === 'bottom-right') {
      newWidth = dragStartWidthRef.current + deltaX
    } else {
      newWidth = dragStartWidthRef.current - deltaX
    }

    if (dragCorner === 'bottom-left' || dragCorner === 'bottom-right') {
      newHeight = dragStartHeightRef.current + deltaY
    } else {
      newHeight = dragStartHeightRef.current - deltaY
    }

    newWidth = Math.max(200, Math.min(maxWidthRef.current, newWidth))
    newHeight = Math.max(100, Math.min(2000, newHeight))

    updateAttributes({
      width: newWidth,
      height: newHeight
    })
  }, [isDragging, dragCorner, updateAttributes])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragCorner(null)
  }, [])

  useEffect(() => {
    setEditSrc(attrs.src ?? '')
  }, [attrs.src])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleSave = async () => {
    if (editSrc.trim()) {
      try {
        let validatedUrl = extractSrcFromIframe(editSrc)
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
        })
      } catch (error) {
        // 错误处理已经在 onValidateUrl 中处理
      }
    }
    handleClosePopover()
  }

  if (!attrs.src && !editor.isEditable) {
    return null
  }

  if (!editor.isEditable) {
    return <ReadonlyIframe attrs={attrs} />
  }

  if (!attrs.src) {
    return <InsertIframe selected={selected} attrs={attrs} updateAttributes={updateAttributes as any} onValidateUrl={onValidateUrl} />
  }

  return (
    <NodeViewWrapper
      className={`iframe-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
    >
      <Box sx={{
        backgroundColor: 'transparent !important',
        textAlign: attrs.align || undefined,
      }}>
        <HoverPopover
          keepOpen={keepHoverPopoverOpen}
          placement="top"
          offset={4}
          actions={
            <Stack
              direction={'row'}
              alignItems={'center'}
              sx={{ p: 0.5 }}
            >
              <ToolbarItem
                ref={editButtonRef}
                icon={<EditLineIcon sx={{ fontSize: '1rem' }} />}
                tip="更换链接"
                onClick={handleShowPopover}
              />
              <Divider
                orientation="vertical"
                flexItem
                sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }}
              />
              <ToolbarItem
                icon={<AlignLeftIcon sx={{ fontSize: '1rem' }} />}
                tip="左侧对齐"
                className={attrs.align === 'left' ? 'tool-active' : ''}
                onClick={() => updateAttributes({ align: attrs.align === 'left' ? null : 'left' })}
              />
              <ToolbarItem
                icon={<AlignCenterIcon sx={{ fontSize: '1rem' }} />}
                tip="居中对齐"
                className={attrs.align === 'center' ? 'tool-active' : ''}
                onClick={() => updateAttributes({ align: attrs.align === 'center' ? null : 'center' })}
              />
              <ToolbarItem
                icon={<AlignRightIcon sx={{ fontSize: '1rem' }} />}
                tip="右侧对齐"
                className={attrs.align === 'right' ? 'tool-active' : ''}
                onClick={() => updateAttributes({ align: attrs.align === 'right' ? null : 'right' })}
              />
              <Divider
                orientation="vertical"
                flexItem
                sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }}
              />
              <ActionDropdown
                id='iframe-width-dropdown'
                selected={getCurrentWidthPercent()}
                defaultDisplay={
                  !isPercentWidth() ? {
                    label: '固定宽度',
                  } : undefined
                }
                list={[
                  {
                    key: '50',
                    label: '自适应宽度（50%）',
                    onClick: () => updateAttributes({ width: '50%' }),
                  },
                  {
                    key: '75',
                    label: '自适应宽度（75%）',
                    onClick: () => updateAttributes({ width: '75%' }),
                  },
                  {
                    key: '100',
                    label: '自适应宽度（100%）',
                    onClick: () => updateAttributes({ width: '100%' }),
                  },
                ]}
              />
              <Divider
                orientation="vertical"
                flexItem
                sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }}
              />
              <ToolbarItem
                icon={<DeleteLineIcon sx={{ fontSize: '1rem' }} />}
                tip="删除"
                onClick={deleteNode}
              />
            </Stack>
          }
          style={{
            display: 'inline-block',
            ...(typeof attrs.width === 'string' && attrs.width.endsWith('%')
              ? { width: attrs.width }
              : {}),
          }}
        >
          <Box
            ref={iframeContentRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            sx={{
              position: 'relative',
            }}
          >
            <iframe
              ref={iframeRef}
              src={attrs.src}
              width={typeof attrs.width === 'number' ? attrs.width : undefined}
              height={attrs.height}
              style={{
                width: typeof attrs.width === 'string' && attrs.width.endsWith('%') ? '100%' : undefined,
                maxWidth: '100%',
                cursor: isDragging ? 'default' : 'pointer',
                border: '2px solid',
                borderColor: (isHovering || isDragging) ? alpha(theme.palette.primary.main, 0.3) : 'transparent',
                display: 'block',
              }}
              frameBorder="0"
              allowFullScreen
            />
            {(isHovering || isDragging) && (
              <>
                <Box
                  onMouseDown={(e) => handleMouseDown(e, 'top-left')}
                  sx={{
                    position: 'absolute',
                    left: -4,
                    top: -4,
                    width: 12,
                    height: 12,
                    bgcolor: 'background.default',
                    cursor: 'nwse-resize',
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: (isDragging && dragCorner === 'top-left') ? 'primary.main' : alpha(theme.palette.primary.main, 0.3),
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                />
                <Box
                  onMouseDown={(e) => handleMouseDown(e, 'top-right')}
                  sx={{
                    position: 'absolute',
                    right: -4,
                    top: -4,
                    width: 12,
                    height: 12,
                    bgcolor: 'background.default',
                    cursor: 'nesw-resize',
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: (isDragging && dragCorner === 'top-right') ? 'primary.main' : alpha(theme.palette.primary.main, 0.3),
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                />
                <Box
                  onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
                  sx={{
                    position: 'absolute',
                    left: -4,
                    bottom: -2,
                    width: 12,
                    height: 12,
                    cursor: 'nesw-resize',
                    borderRadius: '50%',
                    border: '2px solid',
                    bgcolor: 'background.default',
                    borderColor: (isDragging && dragCorner === 'bottom-left') ? 'primary.main' : alpha(theme.palette.primary.main, 0.3),
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                />
                {/* 右下角 */}
                <Box
                  onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
                  sx={{
                    position: 'absolute',
                    right: -4,
                    bottom: -2,
                    width: 12,
                    height: 12,
                    bgcolor: 'background.default',
                    cursor: 'nwse-resize',
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: (isDragging && dragCorner === 'bottom-right') ? 'primary.main' : alpha(theme.palette.primary.main, 0.3),
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                />
              </>
            )}
          </Box>
        </HoverPopover>
      </Box>
      <FloatingPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        placement="bottom"
      >
        <Stack sx={{ p: 2, width: 350 }}>
          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: '1.5', mb: 1 }}>链接地址</Box>
          <TextField
            fullWidth
            multiline
            rows={5}
            size="small"
            value={editSrc}
            onChange={(e) => setEditSrc(e.target.value)}
            placeholder="输入要嵌入的 URL"
          />
          <Stack direction={'row'} gap={1} alignItems={'center'} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={handleClosePopover}
            >
              取消
            </Button>
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={handleSave}
              disabled={!editSrc.trim()}
            >
              保存
            </Button>
          </Stack>
        </Stack>
      </FloatingPopover>
    </NodeViewWrapper>
  )
}

export default IframeViewWrapper


