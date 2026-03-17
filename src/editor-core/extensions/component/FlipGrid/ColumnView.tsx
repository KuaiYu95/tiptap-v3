import HoverPopover from '../../../../components/HoverPopover'
import { DeleteLineIcon, FlipLeftLineIcon, FlipRightLineIcon } from '../../../../components/Icons'
import { ToolbarItem } from '../../../../components/Toolbar'
import { Divider, Stack } from '@mui/material'
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import React, { useEffect, useMemo, useRef } from 'react'
import { MAX_COLUMNS, MIN_WIDTH } from '../../node/FlipGrid'
import { applyFlipGridWidths, collectWidths, findChildIndex, findFlipGridAncestor, normalizeWithMin } from './utils'

const ColumnView: React.FC<NodeViewProps> = ({ node, editor, getPos }) => {
  const widths = useMemo(() => {
    const pos = typeof getPos === 'function' ? getPos() : getPos
    if (typeof pos !== 'number') return []
    const $pos = editor.state.doc.resolve(pos)
    const found = findFlipGridAncestor($pos)
    if (!found) return []
    const parent = found.node

    const list = collectWidths(parent)

    const total = list.reduce((acc, cur) => acc + cur, 0)
    if (!Number.isFinite(total) || total <= 0 || total > 100000) {
      const fallback = parent.childCount > 0 ? 100 / parent.childCount : 0
      return normalizeWithMin(new Array(parent.childCount).fill(fallback), MIN_WIDTH)
    }

    return normalizeWithMin(list, MIN_WIDTH)
  }, [node, getPos])

  const applyWidths = (nextWidths: number[], insertAt?: number, removeIndex?: number, focusIndex?: number) => {
    const { state, view } = editor
    const pos = typeof getPos === 'function' ? getPos() : getPos
    if (typeof pos !== 'number') return false
    const $pos = state.doc.resolve(pos)
    const found = findFlipGridAncestor($pos)
    if (!found) {
      console.warn('[FlipGrid] parent not found for applyWidths', { pos, depth: $pos.depth })
      return false
    }
    const { node: parent, depth: parentDepth } = found
    const parentPos = $pos.start(parentDepth) - 1
    if (!Number.isFinite(parentPos) || parentPos < 0) return false

    const tr = state.tr
    const { changed } = applyFlipGridWidths({
      tr,
      parentNode: parent,
      parentPos,
      nextWidths,
      minWidth: MIN_WIDTH,
      insertAt,
      removeIndex,
      selection: state.selection,
      focusIndex,
    })
    if (changed) {
      view.dispatch(tr)
      if (typeof focusIndex === 'number') {
        view.focus()
      }
    }
    return changed
  }

  const handleInsert = (direction: 'left' | 'right') => {
    if (!editor.isEditable) return
    const pos = typeof getPos === 'function' ? getPos() : getPos
    if (typeof pos !== 'number') return
    const $pos = editor.state.doc.resolve(pos)
    const found = findFlipGridAncestor($pos)
    if (!found) {
      console.warn('[FlipGrid] parent not found for insert', { pos, depth: $pos.depth })
      return
    }
    const { node: parent, depth: parentDepth } = found
    const colIndex = findChildIndex(parent, node)
    if (colIndex < 0) return
    if (parent.childCount >= MAX_COLUMNS) return

    const insertIndex = direction === 'left' ? colIndex : colIndex + 1
    const currentWidths = collectWidths(parent)
    const newWidth = Math.max(MIN_WIDTH, Number((100 / (parent.childCount + 1)).toFixed(2)))
    const shrinkFactor = (100 - newWidth) / 100
    const nextWidths = currentWidths.map(w => w * shrinkFactor)
    nextWidths.splice(insertIndex, 0, newWidth)
    applyWidths(nextWidths, insertIndex, undefined, insertIndex)
  }

  const handleDelete = () => {
    if (!editor.isEditable) return
    const pos = typeof getPos === 'function' ? getPos() : getPos
    if (typeof pos !== 'number') return
    const $pos = editor.state.doc.resolve(pos)
    const found = findFlipGridAncestor($pos)
    if (!found) {
      console.warn('[FlipGrid] parent not found for delete', { pos, depth: $pos.depth })
      return
    }
    const { node: parent, depth: parentDepth } = found
    if (parent.childCount <= 2) return
    const colIndex = findChildIndex(parent, node)
    if (colIndex < 0) return
    const currentWidths = collectWidths(parent)
    const nextWidths = currentWidths.filter((_, idx) => idx !== colIndex)
    const targetFocus = Math.max(0, Math.min(colIndex - 1, nextWidths.length - 1))
    applyWidths(nextWidths, undefined, colIndex, targetFocus)
  }

  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const parent = (wrapperRef.current || null)?.parentElement
    if (!parent) return
    parent.style.width = `${node.attrs.width ?? 0}%`
  }, [node.attrs.width])

  return (
    <NodeViewWrapper
      as="div"
      ref={wrapperRef}
      data-type="flip-grid-column"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      {editor.isEditable ? <HoverPopover
        placement="top"
        offset={4}
        actions={<Stack direction={'row'} alignItems={'center'} sx={{ p: 0.5 }}>
          <ToolbarItem
            icon={<FlipLeftLineIcon sx={{ fontSize: '1rem' }} />}
            text="左侧插入"
            onClick={() => handleInsert('left')}
          />
          <ToolbarItem
            icon={<FlipRightLineIcon sx={{ fontSize: '1rem' }} />}
            text="右侧插入"
            onClick={() => handleInsert('right')}
          />
          {widths.length > 2 && (
            <>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }}
              />
              <ToolbarItem
                icon={<DeleteLineIcon sx={{ fontSize: '1rem' }} />}
                tip="删除当前栏"
                onClick={handleDelete}
              />
            </>
          )}
        </Stack>}
      >
        <NodeViewContent className="flip-grid-column-inner" />
      </HoverPopover> : <NodeViewContent className="flip-grid-column-inner" />}
    </NodeViewWrapper>
  )
}

export default ColumnView
