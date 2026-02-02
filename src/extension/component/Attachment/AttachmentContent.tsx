import { Download2LineIcon, FileIcon } from "@ctzhian/tiptap/component/Icons"
import { EyeLineIcon } from "@ctzhian/tiptap/component/Icons/eye-line-icon"
import { alpha, Box, IconButton, Stack, useTheme } from "@mui/material"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { AttachmentAttributes } from "."

interface AttachmentContentProps {
  attrs: AttachmentAttributes
  type: 'icon' | 'block'
  isPdf: boolean
  editable?: boolean
  updateAttributes?: (attrs: Partial<AttachmentAttributes>) => void
}

/**
 * 附件内容组件
 * 用于渲染附件的实际内容，支持编辑和只读模式
 */
export const AttachmentContent: React.FC<AttachmentContentProps> = ({ attrs, type, isPdf, editable = false, updateAttributes }) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragCorner, setDragCorner] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null>(null)
  const dragStartYRef = useRef(0)
  const dragStartHeightRef = useRef(0)

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const a = document.createElement('a')
      a.href = attrs.url
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error('预览失败:', error)
      window.open(attrs.url, '_blank')
    }
  }

  // 处理文件下载
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const response = await fetch(attrs.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = attrs.title
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('下载失败:', error)
      // 如果 fetch 失败，回退到直接打开链接
      window.open(attrs.url, '_blank')
    }
  }

  // 拖拽调整高度
  const handleMouseDown = (e: React.MouseEvent, corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragCorner(corner)
    dragStartYRef.current = e.clientY
    dragStartHeightRef.current = attrs.height || 300
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragCorner) return
    const deltaY = e.clientY - dragStartYRef.current
    let newHeight: number

    // 根据不同的角计算高度变化
    if (dragCorner === 'bottom-left' || dragCorner === 'bottom-right') {
      // 下角：向下拉伸，高度增加
      newHeight = dragStartHeightRef.current + deltaY
    } else {
      // 上角：向上拉伸，高度增加（deltaY 为负时高度增加）
      newHeight = dragStartHeightRef.current - deltaY
    }

    // 限制高度范围：最小 200px，最大 1000px
    newHeight = Math.max(200, Math.min(1000, newHeight))

    if (updateAttributes) {
      updateAttributes({ height: newHeight })
    }
  }, [isDragging, dragCorner, updateAttributes])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragCorner(null)
  }, [])

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
  const blockStyles = editable ? {
    display: 'flex',
    border: '1px solid',
    borderColor: attrs.url === 'error' ? 'error.main' : 'divider',
    cursor: 'pointer',
    borderRadius: 'var(--mui-shape-borderRadius)',
    bgcolor: 'background.paper',
    p: 2,
    color: 'inherit',
    ':hover': {
      borderColor: attrs.url === 'error' ? 'error.main' : 'primary.main',
    },
  } : attrs.view === '1' ? {
    display: 'flex',
    border: '1px solid',
    borderColor: attrs.url === 'error' ? 'error.main' : 'divider',
    cursor: 'pointer',
    borderRadius: 'var(--mui-shape-borderRadius)',
    bgcolor: 'background.paper',
    p: 2,
    color: 'inherit',
    ':hover': {
      borderColor: attrs.url === 'error' ? 'error.main' : 'primary.main',
    },
  } : {
    display: 'block',
  }

  const blockInnerStyles = editable ? {
    width: '100%'
  } : {
    border: '1px solid',
    borderColor: attrs.url === 'error' ? 'error.main' : 'divider',
    color: 'text.primary',
    cursor: 'pointer',
    borderRadius: 'var(--mui-shape-borderRadius)',
    bgcolor: 'background.paper',
    p: 2,
    ':hover': {
      borderColor: attrs.url === 'error' ? 'error.main' : 'primary.main',
    },
  }

  const inlineStyles = editable ? {
    color: 'primary.main',
    cursor: 'pointer',
    borderRadius: 'var(--mui-shape-borderRadius)',
    transition: 'background-color 0.2s ease',
    display: 'inline',
    ':hover': {
      bgcolor: 'background.paper',
    },
  } : {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    color: 'primary.main',
    cursor: 'pointer',
  }

  return (
    <>
      {type === 'block' ? (
        attrs.view === '1' && isPdf && attrs.url && attrs.url !== 'error' ? (
          <Box
            sx={{ position: 'relative' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Box
              sx={{
                ...blockStyles,
                p: 0,
                overflow: 'hidden',
                height: `${attrs.height || 300}px`,
              }}
              {...(!editable && { 'data-title': attrs.title, 'data-type': type })}
            >
            <iframe
              src={attrs.url + '#navpanes=0&toolbar=1'}
              width="100%"
              height="100%"
              allowFullScreen
              style={{
                border: 'none',
                display: 'block',
                pointerEvents: isDragging ? 'none' : 'auto',
              }}
              title={attrs.title}
            />
            </Box>
            {editable && (isHovered || isDragging) && (
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
                    cursor: 'ns-resize',
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
                    cursor: 'ns-resize',
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
                    cursor: 'ns-resize',
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
                    cursor: 'ns-resize',
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
        ) : (
          <Box
            {...(!editable && { 'data-title': attrs.title, 'data-type': attrs.type })}
            sx={blockStyles}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Stack
              direction={'row'}
              alignItems={'center'}
              gap={2}
              sx={blockInnerStyles}
              {...(!editable && { 'data-title': attrs.title, 'data-type': type })}
            >
              <FileIcon sx={{
                fontSize: '1.625rem',
                color: attrs.url === 'error' ? 'error.main' : 'primary.main',
                alignSelf: 'center',
              }} />
              <Stack sx={{ flex: 1 }} gap={0.5}>
                <Box sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                  {attrs.title}
                </Box>
                {Number(attrs.size) > 0 && <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{attrs.size}</Box>}
              </Stack>
              {isHovered && <Stack direction={'row'} gap={0.5}>
                {isPdf && <IconButton
                  size="small"
                  onClick={handlePreview}
                  sx={{
                    color: attrs.url === 'error' ? 'error.main' : 'text.disabled',
                    alignSelf: 'center',
                  }}
                >
                  <EyeLineIcon sx={{ fontSize: '1rem' }} />
                </IconButton>}
                <IconButton
                  size="small"
                  onClick={handleDownload}
                  sx={{
                    color: attrs.url === 'error' ? 'error.main' : 'text.disabled',
                    alignSelf: 'center',
                  }}
                >
                  <Download2LineIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Stack>}
            </Stack>
          </Box>
        )
      ) : (
        <Box
          {...(!editable && { 'data-title': attrs.title, 'data-type': attrs.type })}
          sx={inlineStyles}
          onClick={handleDownload}
        >
          {editable ? (
            <Box component={'span'} sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
            }}>
              <Download2LineIcon sx={{
                fontSize: '0.875rem',
                cursor: 'grab',
                color: 'primary.main',
                alignSelf: 'center',
                ':active': {
                  cursor: 'grabbing',
                }
              }} />
              {attrs.title}
            </Box>
          ) : (
            <>
              <Download2LineIcon sx={{
                fontSize: '0.875rem',
                cursor: 'grab',
                color: 'primary.main',
                alignSelf: 'center',
                ':active': {
                  cursor: 'grabbing',
                }
              }} />
              {attrs.title}
            </>
          )}
        </Box>
      )}
    </>
  )
}

export default AttachmentContent

