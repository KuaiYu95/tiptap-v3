import FloatingPopover from "../FloatingPopover"
import React, { ReactNode } from "react"
import { useHoverPopover } from "../shared/use-hover-popover"

export interface HoverPopoverProps {
  /** 被包裹的触发元素 */
  children: ReactNode
  /** Popover 内部展示的内容 */
  actions: ReactNode
  /** hover 延迟时间（毫秒），默认 500ms */
  hoverDelay?: number
  /** 关闭延迟时间（毫秒），默认 300ms */
  closeDelay?: number
  /** Popover 位置，默认 'top' */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /** Popover 与触发元素的距离（像素），默认 4 */
  offset?: number
  /** 是否禁用 hover 效果 */
  disabled?: boolean
  /** 自定义类名 */
  className?: string
  /** 样式对象 */
  style?: React.CSSProperties
  /** 是否保持打开状态（用于点击 action 按钮触发弹框时保持打开） */
  keepOpen?: boolean
}

/**
 * HoverPopover 组件
 * 
 * 当鼠标悬停在 children 上超过指定时间后，显示 popover
 * 支持鼠标移到 popover 上时保持打开状态
 */
export const HoverPopover: React.FC<HoverPopoverProps> = ({
  children,
  actions,
  hoverDelay = 500,
  closeDelay = 300,
  placement = 'top',
  offset = 4,
  disabled = false,
  className,
  style,
  keepOpen = false,
}) => {
  const {
    anchorEl,
    childRef,
    handleMouseEnter,
    handleMouseLeave,
    handlePopoverMouseEnter,
    handlePopoverMouseLeave,
    handleForceClose,
  } = useHoverPopover({
    disabled,
    keepOpen,
    hoverDelay,
    closeDelay,
  })

  return (
    <>
      <div
        ref={childRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`hover-popover-child ${className || ''}`}
        style={style}
      >
        {children}
      </div>
      <FloatingPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleForceClose}
        placement={placement}
        offset={offset}
        onMouseEnter={handlePopoverMouseEnter}
        onMouseLeave={handlePopoverMouseLeave}
      >
        {actions}
      </FloatingPopover>
    </>
  )
}

export default HoverPopover
