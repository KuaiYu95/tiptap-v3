import { HoverPopover } from "../../../components"
import { EditorFnProps } from "../../../types"
import { alpha, Box, useTheme } from "@mui/material"
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import React, { useEffect, useRef, useState } from "react"
import { useAnchoredPopover } from "../../../editor-core/extensions/component/shared/edit-popover"
import { MediaEditPopover } from "../shared/media-edit-popover"
import { MediaHoverToolbar } from "../shared/media-hover-toolbar"
import { MediaResizeHandles } from "../shared/media-resize-handles"
import { useMediaResize } from "../shared/use-media-resize"
import { useMediaWidth } from "../shared/use-media-width"
import InsertVideo from "./Insert"
import ReadonlyVideo from "./Readonly"

export interface VideoAttributes {
  src: string
  width?: number | string | null
  controls: boolean
  autoplay: boolean
  loop: boolean
  muted: boolean
  poster: string | null
  align: 'left' | 'center' | 'right' | null
}

const VideoViewWrapper: React.FC<NodeViewProps & EditorFnProps> = ({
  editor,
  node,
  updateAttributes,
  deleteNode,
  selected,
  onUpload,
  onError,
  onValidateUrl
}) => {
  const attrs = node.attrs as VideoAttributes
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContentRef = useRef<HTMLDivElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const theme = useTheme()

  const [isHovering, setIsHovering] = useState(false)
  const [editSrc, setEditSrc] = useState(attrs.src)
  const [keepHoverPopoverOpen, setKeepHoverPopoverOpen] = useState(false)
  const { anchorEl, isOpen, openFromRef, close } = useAnchoredPopover<HTMLButtonElement>()

  const {
    isPercentWidth,
    getCurrentWidthPercent,
    getEditorWidth,
    getCurrentDisplayWidth,
  } = useMediaWidth({
    editor,
    contentRef: videoContentRef,
    nodeClassName: 'node-video',
    width: attrs.width,
    elementRef: videoRef,
  })

  const { isDragging, dragCorner, handleMouseDown } = useMediaResize({
    minWidth: 200,
    maxWidth: getEditorWidth,
    getInitialWidth: getCurrentDisplayWidth,
    onResize: ({ width }) => {
      updateAttributes({ width })
    },
    mode: 'width',
  })

  const handleShowPopover = () => {
    setKeepHoverPopoverOpen(true)
    openFromRef()
  }

  const handleClosePopover = () => {
    close()
    setKeepHoverPopoverOpen(false)
  }
  useEffect(() => {
    setEditSrc(attrs.src)
  }, [attrs.src])

  const handleSave = async () => {
    if (editSrc.trim()) {
      try {
        let validatedUrl = editSrc.trim()
        if (onValidateUrl) {
          validatedUrl = await Promise.resolve(onValidateUrl(validatedUrl, 'video'))
        }
        updateAttributes({
          src: validatedUrl,
          width: attrs.width,
          controls: attrs.controls,
          autoplay: attrs.autoplay,
          loop: attrs.loop,
          muted: attrs.muted,
          poster: attrs.poster,
          align: attrs.align,
        })
        setEditSrc(validatedUrl)
      } catch (error) {
        onError?.(error as Error)
      }
    }
    handleClosePopover()
  }

  if (!attrs.src && !editor.isEditable) {
    return null
  }

  if (!editor.isEditable) {
    return <ReadonlyVideo attrs={attrs} onError={onError} />
  }

  if (!attrs.src) {
    return <InsertVideo selected={selected} attrs={attrs} updateAttributes={updateAttributes} onUpload={onUpload} onError={onError} onValidateUrl={onValidateUrl} />
  }

  return (
    <NodeViewWrapper
      className={`video-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
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
              editTip="更换视频链接"
              onEdit={handleShowPopover}
              downloadTip="下载视频"
              onDownload={() => {
                const video = document.createElement('a')
                video.href = attrs.src
                video.target = '_blank'
                video.download = attrs.src.split('/').pop() || 'video.mp4'
                document.body.appendChild(video)
                video.click()
                document.body.removeChild(video)
              }}
              align={attrs.align}
              onAlignChange={(align) => updateAttributes({ align: attrs.align === align ? null : align })}
              widthDropdownId="video-width-dropdown"
              selectedWidth={getCurrentWidthPercent()}
              useFixedWidthDisplay={!isPercentWidth()}
              onWidthPercentChange={(width) => updateAttributes({ width })}
              deleteTip="删除视频"
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
            ref={videoContentRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            sx={{
              position: 'relative',
            }}
          >
            <video
              ref={videoRef}
              src={attrs.src}
              width={typeof attrs.width === 'number' ? attrs.width : undefined}
              style={{
                width: typeof attrs.width === 'string' && attrs.width.endsWith('%') ? '100%' : undefined,
                maxWidth: '100%',
                height: 'auto',
                cursor: isDragging ? 'default' : 'pointer',
                border: '2px solid',
                borderColor: (isHovering || isDragging) ? alpha(theme.palette.primary.main, 0.3) : 'transparent',
                display: 'block',
              }}
              poster={attrs.poster || undefined}
              controls={attrs.controls}
              autoPlay={attrs.autoplay}
              loop={attrs.loop}
              muted={attrs.muted}
              onError={(e) => {
                onError?.(e as unknown as Error)
              }}
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
        label="视频地址"
        value={editSrc}
        onChange={setEditSrc}
        placeholder="输入视频的 URL"
        onSave={handleSave}
      />
    </NodeViewWrapper>
  )
}

export default VideoViewWrapper
