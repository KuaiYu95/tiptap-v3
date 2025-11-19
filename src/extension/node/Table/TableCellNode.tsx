import { TableCell, type TableCellOptions } from "@tiptap/extension-table"
import { TextSelection } from "@tiptap/pm/state"
import { cellAround } from "@tiptap/pm/tables"

export const TableCellNode = TableCell.extend<TableCellOptions>({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      "Mod-a": () => {
        const { state, view } = this.editor
        const { selection, doc } = state

        const $anchor = selection.$anchor
        const cellPos = cellAround($anchor)
        if (!cellPos) {
          return false
        }

        const cellNode = doc.nodeAt(cellPos.pos)
        if (!cellNode || !cellNode.textContent) {
          return false
        }

        const from = cellPos.pos + 1
        const to = cellPos.pos + cellNode.nodeSize - 1

        if (from >= to) {
          return true
        }

        const $from = doc.resolve(from)
        const $to = doc.resolve(to)

        const nextSel = TextSelection.between($from, $to, 1)
        if (!nextSel) {
          return true
        }

        if (state.selection.eq(nextSel)) {
          return true
        }

        view.dispatch(state.tr.setSelection(nextSel))
        return true
      },
    }
  },
})