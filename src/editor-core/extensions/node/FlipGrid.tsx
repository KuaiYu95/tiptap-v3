import { mergeAttributes, Node } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { ReactNodeViewRenderer } from '@tiptap/react'
import FlipGridView from '../component/FlipGrid'
import FlipGridColumnView from '../component/FlipGrid/ColumnView'

export const MIN_WIDTH = 5
export const MAX_COLUMNS = 10
export const DEFAULT_GAP = '16px'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    flipGrid: {
      setFlipGrid: (columns?: number) => ReturnType
    }
  }
}

const normalizeWidths = (widths: number[]) => {
  const total = widths.reduce((acc, cur) => acc + cur, 0) || 1
  return widths.map(width => (width / total) * 100)
}

export const FlipGridColumnExtension = Node.create({
  name: 'flipGridColumn',
  content: 'block+',
  isolating: true,
  defining: true,

  addAttributes() {
    return {
      width: {
        default: 50,
        parseHTML: element => {
          const value = Number(element.getAttribute('data-width') || element.style.width?.replace('%', ''))
          if (Number.isFinite(value)) return value
          return 50
        },
        renderHTML: attributes => {
          const width = Number(attributes.width) || 50
          return {
            'data-width': width,
            style: `width: ${width}%;`,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="flip-grid-column"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        { 'data-type': 'flip-grid-column' },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      0,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(FlipGridColumnView)
  },
})

export const FlipGridExtension = Node.create({
  name: 'flipGrid',
  group: 'block',
  content: 'flipGridColumn{2,10}',
  isolating: true,
  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'flip-grid',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="flip-grid"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ 'data-type': 'flip-grid' }, this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },

  addCommands() {
    return {
      setFlipGrid:
        (columns = 2) =>
          ({ state, dispatch }) => {
            const columnCount = Math.max(2, Math.min(MAX_COLUMNS, Math.floor(columns)))
            const widths = normalizeWidths(new Array(columnCount).fill(1))
            const { schema, selection } = state
            const gridType = schema.nodes.flipGrid
            const colType = schema.nodes.flipGridColumn
            const paraType = schema.nodes.paragraph
            if (!gridType || !colType || !paraType) return false

            const gridNode = gridType.create(
              {},
              widths.map(width => colType.create(
                { width },
                paraType.createAndFill(),
              )),
            )

            let tr = state.tr.replaceSelectionWith(gridNode, false)

            const $from = tr.selection.$from
            const tryResolveGridStart = () => {
              const after = $from.nodeAfter
              if (after?.type === gridType) return $from.pos
              const before = $from.nodeBefore
              if (before?.type === gridType) return $from.pos - before.nodeSize

              const $prev = tr.doc.resolve(Math.max(0, $from.pos - 1))
              if ($prev.nodeAfter?.type === gridType) return $prev.pos
              if ($prev.nodeBefore?.type === gridType) return $prev.pos - ($prev.nodeBefore?.nodeSize || 0)
              return null
            }

            const gridStart = tryResolveGridStart()
            if (gridStart !== null) {
              const textPos = Math.min(tr.doc.content.size, gridStart + 3)
              tr = tr.setSelection(TextSelection.near(tr.doc.resolve(textPos)))
            }

            if (dispatch) {
              dispatch(tr.scrollIntoView())
            }
            return true
          },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(FlipGridView)
  },
})

export default FlipGridExtension

