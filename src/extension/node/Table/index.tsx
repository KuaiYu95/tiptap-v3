import { Extension } from "@tiptap/core"
import type {
  TableCellOptions,
  TableHeaderOptions,
  TableOptions,
  TableRowOptions,
} from "@tiptap/extension-table"
import { TableHeader, TableRow } from "@tiptap/extension-table"
import { TableCellNode } from "./TableCellNode"
import { TableNode } from "./TableNode"

export interface TableNodeOptions {
  /**
   * If set to false, the table extension will not be registered
   * @example table: false
   */
  table: Partial<TableOptions> | false
  /**
   * If set to false, the table extension will not be registered
   * @example tableCell: false
   */
  tableCell: Partial<TableCellOptions> | false
  /**
   * If set to false, the table extension will not be registered
   * @example tableHeader: false
   */
  tableHeader: Partial<TableHeaderOptions> | false
  /**
   * If set to false, the table extension will not be registered
   * @example tableRow: false
   */
  tableRow: Partial<TableRowOptions> | false
}

/**
 * The table kit is a collection of table editor extensions.
 *
 * It’s a good starting point for building your own table in Tiptap.
 */
export const TableKit = Extension.create<TableNodeOptions>({
  name: "tableKit",

  addExtensions() {
    const extensions = []

    if (this.options.table !== false) {
      extensions.push(TableNode.configure(this.options.table))
    }

    if (this.options.tableCell !== false) {
      extensions.push(TableCellNode.configure(this.options.tableCell))
    }

    if (this.options.tableHeader !== false) {
      extensions.push(TableHeader.configure(this.options.tableHeader))
    }

    if (this.options.tableRow !== false) {
      extensions.push(TableRow.configure(this.options.tableRow))
    }

    return extensions
  },
})