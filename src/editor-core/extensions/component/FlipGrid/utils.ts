import type { Node as PMNode, ResolvedPos } from '@tiptap/pm/model'
import type { Selection, Transaction } from '@tiptap/pm/state'
import { TextSelection } from '@tiptap/pm/state'

export const normalizeWithMin = (widths: number[], minWidth: number) => {
  const total = widths.reduce((acc, cur) => acc + cur, 0) || 1
  let normalized = widths.map(w => (w / total) * 100)

  let deficit = 0
  normalized = normalized.map(w => {
    if (w < minWidth) {
      deficit += minWidth - w
      return minWidth
    }
    return w
  })

  if (deficit > 0) {
    const adjustable = normalized
      .map((w, idx) => ({ w, idx }))
      .filter(item => item.w > minWidth)

    const adjustableTotal = adjustable.reduce((acc, cur) => acc + (cur.w - minWidth), 0)
    if (adjustableTotal > 0) {
      adjustable.forEach(item => {
        const reduceValue = deficit * ((item.w - minWidth) / adjustableTotal)
        normalized[item.idx] = Math.max(minWidth, item.w - reduceValue)
      })
    }
  }

  const finalTotal = normalized.reduce((acc, cur) => acc + cur, 0) || 1
  return normalized.map(w => Number(((w / finalTotal) * 100).toFixed(2)))
}

export const findFlipGridAncestor = ($pos: ResolvedPos): { node: PMNode; depth: number } | null => {
  for (let d = $pos.depth; d >= 0; d -= 1) {
    const candidate = $pos.node(d)
    if (candidate?.type?.name === 'flipGrid') {
      return { node: candidate, depth: d }
    }
  }
  return null
}

export const findChildIndex = (parent: PMNode, node: PMNode) => {
  for (let i = 0; i < parent.childCount; i += 1) {
    if (parent.child(i) === node) return i
  }
  return -1
}

export const collectWidths = (parent: PMNode) => {
  const list: number[] = []
  for (let i = 0; i < parent.childCount; i += 1) {
    const child = parent.child(i)
    const raw = Number(child.attrs.width ?? 0)
    list.push(Number.isFinite(raw) ? raw : 0)
  }
  return list
}

type AdjustParams = {
  tr: Transaction
  parentNode: PMNode
  parentPos: number
  nextWidths: number[]
  minWidth: number
  insertAt?: number
  removeIndex?: number
  selection?: Selection
  focusIndex?: number
}

export const applyFlipGridWidths = ({
  tr,
  parentNode,
  parentPos,
  nextWidths,
  minWidth,
  insertAt,
  removeIndex,
  selection,
  focusIndex,
}: AdjustParams): { changed: boolean } => {
  if (parentPos < 0) return { changed: false }

  const mappedWidths = normalizeWithMin(nextWidths, minWidth)
  const colType = tr.doc.type.schema.nodes.flipGridColumn
  const paragraphType = tr.doc.type.schema.nodes.paragraph
  if (!colType || !paragraphType) return { changed: false }

  const onlyResize =
    mappedWidths.length === parentNode.childCount &&
    typeof insertAt === 'undefined' &&
    typeof removeIndex === 'undefined'

  if (onlyResize) {
    const basePos = parentPos + 1
    let offset = 0
    for (let i = 0; i < parentNode.childCount; i += 1) {
      const child = parentNode.child(i)
      const childPos = basePos + offset
      tr.setNodeMarkup(childPos, undefined, { ...(child.attrs || {}), width: Number(mappedWidths[i].toFixed(2)) })
      offset += child.nodeSize
    }
    if (tr.docChanged) {
      if (typeof focusIndex === 'number') {
        const parentAfter = tr.doc.nodeAt(parentPos)
        if (parentAfter?.type?.name === 'flipGrid' && focusIndex >= 0 && focusIndex < parentAfter.childCount) {
          let offsetToCol = 0
          for (let i = 0; i < focusIndex; i += 1) {
            offsetToCol += parentAfter.child(i).nodeSize
          }
          const colStart = parentPos + 1 + offsetToCol
          const textPos = colStart + 2 // column start + 1 (para start) + 1 (text)
          const safePos = Math.min(tr.doc.content.size, Math.max(0, textPos))
          tr.setSelection(TextSelection.near(tr.doc.resolve(safePos)))
        } else if (selection) {
          const mappedSelection = selection.map(tr.doc, tr.mapping)
          tr.setSelection(mappedSelection)
        }
      } else if (selection) {
        const mappedSelection = selection.map(tr.doc, tr.mapping)
        tr.setSelection(mappedSelection)
      }
    }
    return { changed: tr.docChanged }
  }

  const children: PMNode[] = []
  let sourceIndex = 0
  for (let i = 0; i < mappedWidths.length; i += 1) {
    const shouldInsertNew = typeof insertAt === 'number' && i === insertAt
    if (!shouldInsertNew && typeof removeIndex === 'number') {
      while (sourceIndex === removeIndex) {
        sourceIndex += 1
      }
    }

    const existing = shouldInsertNew ? null : (sourceIndex < parentNode.childCount ? parentNode.child(sourceIndex) : null)
    if (!shouldInsertNew) {
      sourceIndex += 1
    }

    const content = existing ? existing.content : paragraphType.createAndFill()
    children.push(colType.create(
      { ...(existing?.attrs || {}), width: Number(mappedWidths[i].toFixed(2)) },
      content || undefined,
    ))

  }

  const newNode = parentNode.type.create(parentNode.attrs, children, parentNode.marks)
  tr.replaceRangeWith(parentPos, parentPos + parentNode.nodeSize, newNode)
  if (tr.docChanged) {
    if (typeof focusIndex === 'number') {
      const parentAfter = tr.doc.nodeAt(parentPos)
      if (parentAfter?.type?.name === 'flipGrid' && focusIndex >= 0 && focusIndex < parentAfter.childCount) {
        let offsetToCol = 0
        for (let i = 0; i < focusIndex; i += 1) {
          offsetToCol += parentAfter.child(i).nodeSize
        }
        const colStart = parentPos + 1 + offsetToCol
        const textPos = colStart + 2 // column start + 1 (para start) + 1 (text)
        const safePos = Math.min(tr.doc.content.size, Math.max(0, textPos))
        tr.setSelection(TextSelection.near(tr.doc.resolve(safePos)))
      } else if (selection) {
        const mappedSelection = selection.map(tr.doc, tr.mapping)
        tr.setSelection(mappedSelection)
      }
    } else if (selection) {
      const mappedSelection = selection.map(tr.doc, tr.mapping)
      tr.setSelection(mappedSelection)
    }
  }
  return { changed: tr.docChanged }
}

