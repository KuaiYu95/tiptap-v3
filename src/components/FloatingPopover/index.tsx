import { Placement, Strategy, VirtualElement } from '@floating-ui/dom'
import { Paper } from '@mui/material'
import React from 'react'
import { createPortal } from 'react-dom'
import { useFloatingPopover } from '../shared/use-floating-popover'

export interface FloatingPopoverProps {
  open: boolean
  anchorEl: HTMLElement | VirtualElement | null
  onClose: () => void
  children: React.ReactNode
  strategy?: Strategy
  placement?: Placement
  offset?: number
  className?: string
  style?: React.CSSProperties
  onMouseEnter?: (event: React.MouseEvent) => void
  onMouseLeave?: (event: React.MouseEvent) => void
}

export const FloatingPopover: React.FC<FloatingPopoverProps> = ({
  open,
  anchorEl,
  onClose,
  children,
  strategy = 'absolute',
  placement = 'bottom',
  offset: offsetValue = 8,
  className,
  style,
  onMouseEnter,
  onMouseLeave
}) => {
  const { popoverRef, position } = useFloatingPopover({
    open,
    anchorEl,
    onClose,
    placement,
    strategy,
    offsetValue,
  })

  if (!open) return null

  return createPortal(
    <>
      {/* 背景遮罩 */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 5000,
          pointerEvents: 'none'
        }}
      />
      {/* Popover内容 */}
      <Paper
        ref={popoverRef}
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-hidden={false}
        style={{
          position: strategy,
          left: position.x,
          top: position.y,
          zIndex: 1300,
          boxShadow: 'var(--mui-shadows-1)',
          borderRadius: 'var(--mui-shape-borderRadius)',
          opacity: (position.x === 0 && position.y === 0) ? 0 : 1,
          ...style
        }}
        elevation={8}
      >
        {children}
      </Paper>
    </>,
    document.body
  )
}

export default FloatingPopover 
