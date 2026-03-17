import { CustomSizeIcon } from "../../../components/Icons"
import { ToolbarItem } from "../../../components/Toolbar"
import { EditorFnProps } from "../../../types"
import { alpha, Box, Divider, useTheme } from "@mui/material"
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react"
import React, { useEffect, useRef, useState } from "react"
import { HoverPopover } from "../../../components/HoverPopover"
import { ImageViewerItem } from "../../../components/ImageViewer"
import { useAnchoredPopover } from "../../../editor-core/extensions/component/shared/edit-popover"
import { MediaDualFieldEditPopover } from "../shared/media-edit-popover"
import { MediaHoverToolbar } from "../shared/media-hover-toolbar"
import { MediaResizeHandles } from "../shared/media-resize-handles"
import { useMediaResize } from "../shared/use-media-resize"
import CropImage from "./Crop"
import InsertImage from "./Insert"
import ReadonlyImage from "./Readonly"

export interface ImageAttributes {
  src: string
  title?: string
  width: number
}

// 图片尺寸缓存，避免重复加载
export const imageDimensionsCache = new Map<string, { width: number; height: number }>()

// 获取图片尺寸的函数（带缓存）
export const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  // 检查缓存
  if (imageDimensionsCache.has(src)) {
    return Promise.resolve(imageDimensionsCache.get(src)!)
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const dimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight
      }
      // 缓存结果
      imageDimensionsCache.set(src, dimensions)
      resolve(dimensions)
    }
    img.onerror = () => {
      reject(new Error('无法加载图片'))
    }
    img.src = src
  })
}

// 从文件获取图片尺寸（避免重复加载）
export const getImageDimensionsFromFile = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }
      img.onerror = () => {
        reject(new Error('无法读取图片文件'))
      }
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      reject(new Error('无法读取文件'))
    }
    reader.readAsDataURL(file)
  })
}

const ImageViewWrapper: React.FC<NodeViewProps & EditorFnProps> = ({
  editor,
  node,
  updateAttributes,
  deleteNode,
  selected,
  onUpload,
  onUploadImgUrl,
  onError,
  onValidateUrl,
  getPos,
}) => {
  const attrs = node.attrs as ImageAttributes
  const imageRef = useRef<HTMLImageElement>(null)
  const theme = useTheme()

  const [isHovering, setIsHovering] = useState(false)
  const [isCropping, setIsCropping] = useState(false)
  const [editSrc, setEditSrc] = useState(attrs.src || '')
  const [editTitle, setEditTitle] = useState(attrs.title || '')
  const imageContentRef = useRef<HTMLSpanElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const [keepHoverPopoverOpen, setKeepHoverPopoverOpen] = useState(false)
  const { anchorEl, isOpen, openFromRef, close } = useAnchoredPopover<HTMLButtonElement>()
  const handleShowPopover = () => {
    setKeepHoverPopoverOpen(true)
    openFromRef()
  }
  const handleClosePopover = () => {
    close()
    setKeepHoverPopoverOpen(false)
  }

  // 获取当前实际显示的图片宽度
  const getCurrentDisplayWidth = (): number => {
    if (!imageRef.current) return attrs.width

    // 获取图片的实际显示宽度（考虑 maxWidth: 100% 的限制）
    const computedStyle = window.getComputedStyle(imageRef.current)
    const displayWidth = imageRef.current.offsetWidth

    // 如果图片被 CSS 限制为 100%，则使用容器宽度
    if (computedStyle.maxWidth === '100%' && displayWidth < attrs.width) {
      return displayWidth
    }

    return attrs.width
  }

  const { isDragging, dragCorner, handleMouseDown } = useMediaResize({
    minWidth: 100,
    maxWidth: () => 1200,
    getInitialWidth: getCurrentDisplayWidth,
    onResize: ({ width }) => {
      updateAttributes({
        width,
      })
    },
    mode: 'width',
  })

  const handleImageClick = (e: React.MouseEvent) => {
    // 如果正在拖拽调整大小，阻止预览
    if (isDragging || dragCorner) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    // 事件会冒泡到 ImageViewerItem 处理
  }

  const handleCropClick = () => setIsCropping(true)
  const handleCropCancel = () => setIsCropping(false)

  const handleCropConfirm = (imageUrl: string) => {
    updateAttributes({
      src: imageUrl
    })
    setIsCropping(false)
  }

  const handleSave = async () => {
    if (editSrc.trim()) {
      try {
        let validatedUrl = editSrc.trim()
        if (onValidateUrl) {
          validatedUrl = await Promise.resolve(onValidateUrl(validatedUrl, 'image'))
        }
        const currentWidth = getCurrentDisplayWidth()
        updateAttributes({
          src: validatedUrl,
          width: currentWidth,
          error: true,
          title: editTitle.trim(),
        })
        setEditSrc(validatedUrl)
      } catch (error) {
        onError?.(error as Error)
      }
    }
    handleClosePopover()
  }

  const runTextAlignOnImageParagraph = (align: 'left' | 'right' | 'center') => {
    const pos = typeof getPos === 'function' ? getPos() : null
    const chain = editor.chain().focus()
    if (pos != null) {
      chain.setTextSelection(pos)
    }
    chain.toggleTextAlign(align).run()
  }

  useEffect(() => {
    if (attrs.src && (!attrs.width || attrs.width <= 0)) {
      getImageDimensions(attrs.src)
        .then(dimensions => {
          try {
            const pos = typeof getPos === 'function' ? getPos() : null
            if (pos === null || pos === undefined) return

            const currentNode = editor.state.doc.nodeAt(pos)
            if (!currentNode || currentNode.type.name !== 'image') return

            updateAttributes({
              src: attrs.src,
              title: attrs.title || '',
              width: dimensions.width
            })
          } catch (error) {
          }
        })
        .catch(() => {
          try {
            const pos = typeof getPos === 'function' ? getPos() : null
            if (pos === null || pos === undefined) return

            const currentNode = editor.state.doc.nodeAt(pos)
            if (!currentNode || currentNode.type.name !== 'image') return

            updateAttributes({
              src: attrs.src,
              title: attrs.title || '',
              width: 400
            })
          } catch (updateError) {
          }
        })
    }
  }, [attrs, updateAttributes, getPos, editor])

  useEffect(() => {
    setEditSrc(attrs.src || '')
    setEditTitle(attrs.title || '')
  }, [attrs.src, attrs.title])

  if (!attrs.src && !editor.isEditable) {
    return null
  }

  if (!editor.isEditable) {
    return <ReadonlyImage attrs={attrs} />
  }

  if (!attrs.src) {
    return <InsertImage selected={selected} attrs={attrs} onUpload={onUpload} onUploadImgUrl={onUploadImgUrl} updateAttributes={updateAttributes} onError={onError} onValidateUrl={onValidateUrl} />
  }

  if (isCropping) {
    return (
      <CropImage
        selected={selected}
        attrs={attrs}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
        onUpload={onUpload}
        onError={onError}
      />
    )
  }

  return (
    <NodeViewWrapper
      className={`image-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
      as={'span'}
      data-drag-handle
    >
      <HoverPopover
        keepOpen={keepHoverPopoverOpen}
        placement="top"
        offset={4}
        actions={
          <MediaHoverToolbar
            editButtonRef={editButtonRef}
            editTip="编辑图片"
            onEdit={handleShowPopover}
            align={null}
            onAlignChange={(align) => {
              runTextAlignOnImageParagraph(align)
            }}
            widthDropdownId="image-width-dropdown"
            selectedWidth="100"
            useFixedWidthDisplay
            onWidthPercentChange={() => {}}
            deleteTip="删除图片"
            onDelete={deleteNode}
            showWidthDropdown={false}
            extraActions={
              <>
                <ToolbarItem
                  icon={<CustomSizeIcon sx={{ fontSize: '1rem' }} />}
                  tip="裁切图片"
                  onClick={handleCropClick}
                />
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }}
                />
              </>
            }
          />
        }
      >
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            component={'span'}
            ref={imageContentRef}
            sx={{
              position: 'relative',
              display: 'inline-block',
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <ImageViewerItem src={attrs.src}>
              <img
                ref={imageRef}
                src={attrs.src}
                width={attrs.width}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  cursor: isDragging ? 'default' : 'pointer',
                  border: '2px solid',
                  borderColor: (isHovering || isDragging) ? alpha(theme.palette.primary.main, 0.3) : 'transparent',
                  borderRadius: 'var(--mui-shape-borderRadius)',
                  overflow: 'hidden',
                }}
                onClick={handleImageClick}
                onError={(e) => {
                  onError?.(e as unknown as Error)
                }}
              />
            </ImageViewerItem>
            <MediaResizeHandles
              visible={isHovering || isDragging}
              dragCorner={dragCorner}
              isDragging={isDragging}
              onMouseDown={handleMouseDown}
            />
          </Box>
          {attrs.title && (
            <Box
              component="span"
              className="editor-image-title"
              sx={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'text.tertiary',
                textAlign: 'center',
                width: '100%',
                mt: 0.5,
              }}
            >
              {attrs.title}
            </Box>
          )}
        </Box>
      </HoverPopover>
      <MediaDualFieldEditPopover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        primaryLabel="图片地址"
        primaryValue={editSrc}
        onPrimaryChange={setEditSrc}
        primaryPlaceholder="输入图片的 URL"
        secondaryLabel="图片描述"
        secondaryValue={editTitle}
        onSecondaryChange={setEditTitle}
        secondaryPlaceholder="输入图片描述（可选）"
        onSave={handleSave}
      />
    </NodeViewWrapper>
  )
}

export default ImageViewWrapper
