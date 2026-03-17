import { alpha, Box, useTheme } from '@mui/material'
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_GAP, MIN_WIDTH } from '../../node/FlipGrid'
import { applyFlipGridWidths, collectWidths, normalizeWithMin } from './utils'

const clampPair = (left: number, right: number, delta: number) => {
  const nextLeft = Math.min(Math.max(left + delta, MIN_WIDTH), left + right - MIN_WIDTH)
  const nextRight = left + right - nextLeft
  return [nextLeft, nextRight]
}

const FlipGridView: React.FC<NodeViewProps> = ({ node, editor, getPos }) => {
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const [hovering, setHovering] = useState(false)
  const [hoverGapIndex, setHoverGapIndex] = useState<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [showPercents, setShowPercents] = useState(false)
  const [containerWidth, setContainerWidth] = useState(1)
  const [gapPx, setGapPx] = useState(() => {
    const parsed = parseFloat(DEFAULT_GAP || '0')
    return Number.isFinite(parsed) ? parsed : 0
  })

  const widths = useMemo(() => collectWidths(node), [node])
  const safeWidths = useMemo(() => normalizeWithMin(widths, MIN_WIDTH), [widths])

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateMetrics = () => {
      const content = element.querySelector<HTMLElement>('[data-node-view-content-react]') ||
        element.querySelector<HTMLElement>('[data-node-view-content]')
      const contentWidth = content?.getBoundingClientRect().width
      const nextWidth = Math.max(1, contentWidth || element.getBoundingClientRect().width || 1)
      const gapValue = content ? getComputedStyle(content).gap : DEFAULT_GAP
      const parsedGap = parseFloat(gapValue || '0')
      const nextGap = Number.isFinite(parsedGap) ? parsedGap : 0

      setContainerWidth(prev => (prev !== nextWidth ? nextWidth : prev))
      setGapPx(prev => (prev !== nextGap ? nextGap : prev))
    }

    updateMetrics()
    const observer = new ResizeObserver(updateMetrics)
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  const layout = useMemo(() => {
    const gapsTotal = gapPx * Math.max(0, safeWidths.length - 1)
    const availableWidth = Math.max(1, containerWidth - gapsTotal)

    const widthsPx = safeWidths.map(w => (w / 100) * availableWidth)
    let accPx = 0
    const handlePercents: number[] = []
    const labelPercents: number[] = []

    widthsPx.forEach((w, idx) => {
      const startPx = accPx
      const labelPx = startPx + w
      labelPercents.push((labelPx / containerWidth) * 100)

      accPx += w
      if (idx < widthsPx.length - 1) {
        const centerPx = accPx + gapPx / 2
        handlePercents.push((centerPx / containerWidth) * 100)
        accPx += gapPx
      }
    })

    return { handlePercents, labelPercents }
  }, [safeWidths, node.childCount, gapPx, containerWidth])

  const applyWidths = (nextWidths: number[], insertAt?: number) => {
    if (!editor?.state) return
    const position = typeof getPos === 'function' ? getPos() : getPos
    if (typeof position !== 'number') return

    const tr = editor.state.tr
    const { changed } = applyFlipGridWidths({
      tr,
      parentNode: node,
      parentPos: position,
      nextWidths,
      minWidth: MIN_WIDTH,
      insertAt,
      selection: editor.state.selection,
    })

    if (changed) {
      editor.view.dispatch(tr)
    }
  }

  useEffect(() => {
    if (widths.length !== safeWidths.length) {
      applyWidths(safeWidths)
      return
    }

    const diff = widths.some((w, idx) => Math.abs(w - safeWidths[idx]) > 0.01)
    if (diff) {
      applyWidths(safeWidths)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widths, safeWidths])

  const handleResizeStart = (index: number, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!editor.isEditable) return

    const containerWidth = containerRef.current?.getBoundingClientRect().width || 1
    const startX = event.clientX
    const startWidths = [...safeWidths]
    setDragIndex(index)
    setShowPercents(true)

    let rafId: number | null = null
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const deltaPx = e.clientX - startX
        const deltaPercent = (deltaPx / containerWidth) * 100
        const [nextLeft, nextRight] = clampPair(startWidths[index], startWidths[index + 1], deltaPercent)
        const nextWidths = [...startWidths]
        nextWidths[index] = nextLeft
        nextWidths[index + 1] = nextRight
        applyWidths(nextWidths)
      })
    }

    const handleMouseUp = () => {
      setDragIndex(null)
      setShowPercents(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      cleanupRef.current = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    cleanupRef.current = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }

  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  const showHandles = editor?.isEditable && (hovering || dragIndex !== null || hoverGapIndex !== null)

  return (
    <NodeViewWrapper
      ref={containerRef}
      as="div"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => !dragIndex && setHovering(false)}
      data-type="flip-grid"
      style={{
        position: 'relative',
      }}
    >
      <Box sx={{
        '.flip-grid-content > div[data-node-view-content-react]': {
          display: 'flex',
          gap: DEFAULT_GAP,
          alignItems: 'stretch',
          position: 'relative',
        }
      }}>
        <NodeViewContent className='flip-grid-content' />
      </Box>
      {editor?.isEditable && <>
        {layout.handlePercents.map((percent, index) => {
          const gapActive = dragIndex !== null || hoverGapIndex === index
          return (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                left: `${percent}%`,
                width: gapPx,
                top: 0,
                bottom: 0,
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
                zIndex: 2,
                ':hover > div': {
                  bgcolor: alpha(theme.palette.primary.main, 0.7),
                },
              }}
              onMouseEnter={() => setHoverGapIndex(index)}
              onMouseLeave={() => setHoverGapIndex(null)}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  height: 'calc(100% - 16px)',
                  width: 2,
                  minHeight: 16,
                  borderRadius: '4px',
                  cursor: 'ew-resize',
                  opacity: showHandles && gapActive ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                  pointerEvents: 'auto',
                  transform: 'translate(-50%, 0)',
                }}
                onMouseDown={(e) => handleResizeStart(index, e)}
              />
            </Box>
          )
        })}
        {showPercents && layout.labelPercents.map((offset, idx) => {
          return (
            <Box
              key={`percent-${idx}`}
              sx={{
                position: 'absolute',
                top: 4,
                left: `calc(${offset}% - 4px)`,
                transform: 'translate(-100%, 0)',
                px: 0.75,
                py: 0.25,
                borderRadius: '4px',
                bgcolor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                fontSize: '10px',
                lineHeight: 1.2,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {`${Math.round(safeWidths[idx] ?? 0)}%`}
            </Box>
          )
        })}
      </>}
    </NodeViewWrapper>
  )
}

export default FlipGridView

