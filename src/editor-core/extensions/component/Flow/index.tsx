import { ActionDropdown } from "../../../../components"
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, DeleteLineIcon, EditLineIcon } from "../../../../components/Icons"
import { ToolbarItem } from "../../../../components/Toolbar"
import { EditorFnProps } from "../../../../types"
import { alpha, Box, Divider, Stack, useTheme } from "@mui/material"
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import React, { useCallback, useEffect, useRef, useState } from "react"
import { HoverPopover } from "../../../../components/HoverPopover"
import EditFlow from "./Edit"
import FlowDiagram from "./FlowDiagram"
import InsertFlow from "./Insert"
import ReadonlyFlow from "./Readonly"

export interface FlowAttributes {
  code: string
  width?: string | number
  align?: 'left' | 'center' | 'right' | null
}

const FlowViewWrapper: React.FC<NodeViewProps & EditorFnProps> = ({
  editor,
  node,
  updateAttributes,
  deleteNode,
  selected,
  onError
}) => {
  const attrs = node.attrs as FlowAttributes
  const theme = useTheme()
  const [isHovering, setIsHovering] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [keepHoverPopoverOpen, setKeepHoverPopoverOpen] = useState(false)
  const [dragCorner, setDragCorner] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null>(null)
  const dragStartXRef = useRef(0)
  const dragStartWidthRef = useRef(0)
  const flowWrapperRef = useRef<HTMLDivElement>(null)
  const flowContentRef = useRef<HTMLDivElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)

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
    if (flowWrapperRef.current) {
      return flowWrapperRef.current.offsetWidth
    }
    const containerWidth = 800
    return getPixelValue(attrs.width, containerWidth)
  }

  const getPixelValue = (value: string | number | undefined, containerSize: number, defaultPercent: number = 100): number => {
    if (!value) return containerSize * (defaultPercent / 100)
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      if (value.endsWith('%')) {
        const percent = parseFloat(value)
        return containerSize * (percent / 100)
      }
      if (value.endsWith('px')) {
        return parseFloat(value)
      }
      return parseFloat(value) || containerSize * (defaultPercent / 100)
    }
    return containerSize * (defaultPercent / 100)
  }

  const handleMouseDown = (e: React.MouseEvent, corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragCorner(corner)
    dragStartXRef.current = e.clientX
    dragStartWidthRef.current = getCurrentDisplayWidth()
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragCorner) return
    const deltaX = e.clientX - dragStartXRef.current
    let newWidth: number

    if (dragCorner === 'top-right' || dragCorner === 'bottom-right') {
      newWidth = dragStartWidthRef.current + deltaX
    } else {
      newWidth = dragStartWidthRef.current - deltaX
    }

    newWidth = Math.max(200, Math.min(1920, newWidth))
    // 手动调整宽度时，改为固定宽度（像素值）
    updateAttributes({
      width: Math.round(newWidth),
      code: attrs.code,
      align: attrs.align,
    })
  }, [isDragging, dragCorner, attrs.code, updateAttributes])

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

  const handleShowPopover = () => {
    setKeepHoverPopoverOpen(true)
    setIsEditing(true)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setKeepHoverPopoverOpen(false)
  }

  if (!editor.isEditable) {
    return <ReadonlyFlow attrs={attrs} onError={onError} />
  }

  if (!attrs.code || attrs.code.trim() === '') {
    return <InsertFlow updateAttributes={updateAttributes} />
  }

  return (
    <NodeViewWrapper
      className={`flow-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
    >
      <Box
        ref={flowContentRef}
        sx={{
          position: 'relative',
          textAlign: attrs.align || undefined,
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Box
          ref={flowWrapperRef}
          sx={{
            position: 'relative',
            border: '2px solid',
            display: 'inline-block',
            borderColor: (isHovering || isDragging) ? alpha(theme.palette.primary.main, 0.3) : 'transparent',
            borderRadius: 'var(--mui-shape-borderRadius)',
            bgcolor: 'background.paper',
            width: typeof attrs.width === 'string' && attrs.width.endsWith('%')
              ? attrs.width
              : typeof attrs.width === 'number'
                ? `${attrs.width}px`
                : typeof attrs.width === 'string' && attrs.width && !isNaN(parseFloat(attrs.width))
                  ? `${attrs.width}px`
                  : attrs.width || '100%',
            height: 'auto',
            transition: 'border-color 0.2s ease',
          }}
        >
          <HoverPopover
            style={{
              width: '100%',
            }}
            keepOpen={keepHoverPopoverOpen}
            actions={
              <Stack
                direction={'row'}
                alignItems={'center'}
                sx={{ p: 0.5 }}
              >
                <ToolbarItem
                  ref={editButtonRef}
                  icon={<EditLineIcon sx={{ fontSize: '1rem' }} />}
                  tip="编辑流程图"
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
                  onClick={() => updateAttributes({ align: attrs.align === 'left' ? null : 'left', code: attrs.code, width: attrs.width })}
                />
                <ToolbarItem
                  icon={<AlignCenterIcon sx={{ fontSize: '1rem' }} />}
                  tip="居中对齐"
                  className={attrs.align === 'center' ? 'tool-active' : ''}
                  onClick={() => updateAttributes({ align: attrs.align === 'center' ? null : 'center', code: attrs.code, width: attrs.width })}
                />
                <ToolbarItem
                  icon={<AlignRightIcon sx={{ fontSize: '1rem' }} />}
                  tip="右侧对齐"
                  className={attrs.align === 'right' ? 'tool-active' : ''}
                  onClick={() => updateAttributes({ align: attrs.align === 'right' ? null : 'right', code: attrs.code, width: attrs.width })}
                />
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }}
                />
                <ActionDropdown
                  id='flow-width-dropdown'
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
                  tip="删除流程图"
                  onClick={deleteNode}
                />
              </Stack>
            }
            placement="top"
            offset={4}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                borderRadius: 'var(--mui-shape-borderRadius)',
              }}
            >
              <FlowDiagram key={attrs.code} code={attrs.code} onError={onError} />
            </Box>
            {(isHovering || isDragging) && !isEditing && (
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
          </HoverPopover>
        </Box>
      </Box>
      {isEditing && (
        <EditFlow
          anchorEl={editButtonRef.current}
          attrs={attrs}
          updateAttributes={(newAttrs) => {
            updateAttributes(newAttrs)
            handleEditCancel()
          }}
          onCancel={handleEditCancel}
        />
      )}
    </NodeViewWrapper>
  )
}

export default FlowViewWrapper
