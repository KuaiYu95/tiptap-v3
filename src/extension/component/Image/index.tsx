import { FloatingPopover } from "@ctzhian/tiptap/component"
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, CustomSizeIcon, DeleteLineIcon, EditLineIcon } from "@ctzhian/tiptap/component/Icons"
import { ToolbarItem } from "@ctzhian/tiptap/component/Toolbar"
import { EditorFnProps } from "@ctzhian/tiptap/type"
import { alpha, Box, Button, Divider, Stack, TextField, useTheme } from "@mui/material"
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { HoverPopover } from "../../../component/HoverPopover"
import { ImageViewerItem } from "../../../component/ImageViewer"
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

  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isCropping, setIsCropping] = useState(false)
  const [editSrc, setEditSrc] = useState(attrs.src || '')
  const [editTitle, setEditTitle] = useState(attrs.title || '')
  const [dragCorner, setDragCorner] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null>(null)
  const dragStartXRef = useRef(0)
  const dragStartWidthRef = useRef(0)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const imageContentRef = useRef<HTMLSpanElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const [keepHoverPopoverOpen, setKeepHoverPopoverOpen] = useState(false)
  const handleShowPopover = () => {
    setKeepHoverPopoverOpen(true)
    setAnchorEl(editButtonRef.current)
  }
  const handleClosePopover = () => {
    setAnchorEl(null)
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

  const handleMouseDown = (e: React.MouseEvent, corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragCorner(corner)
    dragStartXRef.current = e.clientX
    dragStartWidthRef.current = getCurrentDisplayWidth()
  }

  const handleImageClick = (e: React.MouseEvent) => {
    // 如果正在拖拽调整大小，阻止预览
    if (isDragging || dragCorner) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    // 事件会冒泡到 ImageViewerItem 处理
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragCorner) return
    const deltaX = e.clientX - dragStartXRef.current
    let newWidth: number

    // 根据不同的角计算宽度变化
    if (dragCorner === 'top-right' || dragCorner === 'bottom-right') {
      // 右侧角：向右拉伸，宽度增加
      newWidth = dragStartWidthRef.current + deltaX
    } else {
      // 左侧角：向左拉伸，宽度增加（deltaX 为负时宽度增加）
      newWidth = dragStartWidthRef.current - deltaX
    }

    newWidth = Math.max(100, Math.min(1200, newWidth))
    updateAttributes({
      width: newWidth
    })
  }, [isDragging, dragCorner, updateAttributes])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragCorner(null)
  }, [])
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
      {...({ 'data-drag-handle': false } as any)}
    >
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
              tip="编辑图片"
              onClick={handleShowPopover}
            />
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
            <ToolbarItem
              icon={<AlignLeftIcon sx={{ fontSize: '1rem' }} />}
              tip="左侧对齐"
              onClick={() => {
                runTextAlignOnImageParagraph('left')
              }}
            />
            <ToolbarItem
              icon={<AlignCenterIcon sx={{ fontSize: '1rem' }} />}
              tip="居中对齐"
              onClick={() => {
                runTextAlignOnImageParagraph('center')
              }}
            />
            <ToolbarItem
              icon={<AlignRightIcon sx={{ fontSize: '1rem' }} />}
              tip="右侧对齐"
              onClick={() => {
                runTextAlignOnImageParagraph('right')
              }}
            />
            <Divider
              orientation="vertical"
              flexItem
              sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }}
            />
            <ToolbarItem
              icon={<DeleteLineIcon sx={{ fontSize: '1rem' }} />}
              tip="删除图片"
              onClick={deleteNode}
            />
          </Stack>
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
            {(isHovering || isDragging) && (
              <>
                {/* 左上角 */}
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
                {/* 右上角 */}
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
                {/* 左下角 */}
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
      <FloatingPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        placement="bottom"
      >
        <Stack sx={{ p: 2, width: 350 }}>
          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: '1.5', mb: 1 }}>图片地址</Box>
          <TextField
            fullWidth
            size="small"
            value={editSrc}
            onChange={(e) => setEditSrc(e.target.value)}
            placeholder="输入图片的 URL"
          />
          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: '1.5', my: 1 }}>图片描述</Box>
          <TextField
            fullWidth
            size="small"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="输入图片描述（可选）"
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

export default ImageViewWrapper
