import { HoverPopover } from "../../../components"
import { EditorFnProps } from "../../../types"
import { extractSrcFromIframe, normalizeBilibiliAutoplay } from "../../../utils"
import { alpha, Box, useTheme } from "@mui/material"
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import React, { useEffect, useRef, useState } from "react"
import { useAnchoredPopover } from "../../../editor-core/extensions/component/shared/edit-popover"
import { MediaEditPopover } from "../shared/media-edit-popover"
import { MediaHoverToolbar } from "../shared/media-hover-toolbar"
import { MediaResizeHandles } from "../shared/media-resize-handles"
import { useMediaResize } from "../shared/use-media-resize"
import { useMediaWidth } from "../shared/use-media-width"
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

  const [isHovering, setIsHovering] = useState(false)
  const [editSrc, setEditSrc] = useState(attrs.src ?? '')
  const [keepHoverPopoverOpen, setKeepHoverPopoverOpen] = useState(false)
  const { anchorEl, isOpen, openFromRef, close } = useAnchoredPopover<HTMLButtonElement>()

  const {
    isPercentWidth,
    getCurrentWidthPercent,
    getEditorWidth,
    getCurrentDisplayWidth,
  } = useMediaWidth({
    editor,
    contentRef: iframeContentRef,
    nodeClassName: 'node-iframe',
    width: attrs.width,
    elementRef: iframeRef,
  })

  const getCurrentDisplayHeight = (): number => {
    if (!iframeRef.current) {
      return typeof attrs.height === 'number' ? attrs.height : 400
    }
    return iframeRef.current.offsetHeight
  }

  const { isDragging, dragCorner, handleMouseDown } = useMediaResize({
    minWidth: 200,
    maxWidth: getEditorWidth,
    minHeight: 100,
    maxHeight: 2000,
    getInitialWidth: getCurrentDisplayWidth,
    getInitialHeight: getCurrentDisplayHeight,
    onResize: ({ width, height }) => {
      updateAttributes({
        width,
        height,
      })
    },
    mode: 'size',
  })

  const handleShowPopover = () => {
    setEditSrc(attrs.src ?? '')
    setKeepHoverPopoverOpen(true)
    openFromRef()
  }

  const handleClosePopover = () => {
    close()
    setKeepHoverPopoverOpen(false)
  }

  useEffect(() => {
    setEditSrc(attrs.src ?? '')
  }, [attrs.src])

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
      data-drag-handle
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
            <MediaHoverToolbar
              editButtonRef={editButtonRef}
              editTip="更换链接"
              onEdit={handleShowPopover}
              align={attrs.align}
              onAlignChange={(align) => updateAttributes({ align: attrs.align === align ? null : align })}
              widthDropdownId="iframe-width-dropdown"
              selectedWidth={getCurrentWidthPercent()}
              useFixedWidthDisplay={!isPercentWidth()}
              onWidthPercentChange={(width) => updateAttributes({ width })}
              deleteTip="删除"
              onDelete={deleteNode}
            />
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
            <MediaResizeHandles
              visible={isHovering || isDragging}
              dragCorner={dragCorner}
              isDragging={isDragging}
              onMouseDown={handleMouseDown}
            />
          </Box>
        </HoverPopover>
      </Box>
      <MediaEditPopover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        label="链接地址"
        value={editSrc}
        onChange={setEditSrc}
        placeholder="输入要嵌入的 URL"
        onSave={handleSave}
        multiline
        rows={5}
      />
    </NodeViewWrapper>
  )
}

export default IframeViewWrapper
