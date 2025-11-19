import { EMPTY_CELL_WIDTH, RESIZE_MIN_WIDTH } from "@ctzhian/tiptap/contants/table"
import { Table, TableOptions } from "@tiptap/extension-table"
import type { Node } from "@tiptap/pm/model"
import {
  columnResizing,
  tableEditing,
  TableView
} from "@tiptap/pm/tables"
import type { ViewMutationRecord } from "@tiptap/pm/view"

const calculateCellMinWidth = (cellMinWidth: number): number => {
  return Math.max(cellMinWidth, EMPTY_CELL_WIDTH)
}

class TiptapTableView extends TableView {
  private readonly blockContainer: HTMLDivElement
  private readonly innerTableContainer: HTMLDivElement
  private readonly widgetsContainer: HTMLDivElement
  private readonly overlayContainer: HTMLDivElement
  private readonly containerAttributes: Record<string, string>

  declare readonly node: Node
  declare readonly minCellWidth: number

  constructor(
    node: Node,
    minCellWidth: number,
    containerAttributes: Record<string, string> = {}
  ) {
    super(node, minCellWidth)
    this.containerAttributes = containerAttributes

    this.blockContainer = this.createBlockContainer()
    this.innerTableContainer = this.createInnerTableContainer()
    this.widgetsContainer = this.createWidgetsContainer()
    this.overlayContainer = this.createOverlayContainer()

    this.setupDOMStructure()
  }

  private createBlockContainer(): HTMLDivElement {
    const container = document.createElement("div")
    container.setAttribute("data-content-type", "table")
    this.applyContainerAttributes(container)
    return container
  }

  private createInnerTableContainer(): HTMLDivElement {
    const container = document.createElement("div")
    container.className = "table-container"
    return container
  }

  private createWidgetsContainer(): HTMLDivElement {
    const container = document.createElement("div")
    container.className = "table-controls"
    container.style.position = "relative"
    return container
  }

  private createOverlayContainer(): HTMLDivElement {
    const container = document.createElement("div")
    container.className = "table-selection-overlay-container"
    return container
  }

  private applyContainerAttributes(element: HTMLDivElement): void {
    for (const [key, value] of Object.entries(this.containerAttributes)) {
      if (key !== "class") {
        element.setAttribute(key, value)
      }
    }
  }

  private setupDOMStructure(): void {
    const originalTable = this.dom
    const tableElement = originalTable.firstChild

    if (!tableElement) {
      console.warn("Table element has no first child")
      return
    }

    this.innerTableContainer.appendChild(tableElement)
    originalTable.appendChild(this.innerTableContainer)
    originalTable.appendChild(this.widgetsContainer)
    originalTable.appendChild(this.overlayContainer)
    this.blockContainer.appendChild(originalTable)

    this.dom = this.blockContainer
  }

  ignoreMutation(mutation: ViewMutationRecord): boolean {
    const target = mutation.target as HTMLElement
    const isInsideTable = target.closest(".table-container") !== null
    return !isInsideTable || super.ignoreMutation(mutation)
  }
}

export const TableNode = Table.extend<TableOptions>({
  addProseMirrorPlugins() {
    const isResizable = this.options.resizable && this.editor.isEditable
    const defaultCellMinWidth = calculateCellMinWidth(this.options.cellMinWidth)

    const plugins = [
      tableEditing({
        allowTableNodeSelection: this.options.allowTableNodeSelection,
      }),
    ]

    if (isResizable) {
      plugins.unshift(
        columnResizing({
          handleWidth: this.options.handleWidth,
          cellMinWidth: RESIZE_MIN_WIDTH,
          defaultCellMinWidth,
          View: null,
          lastColumnResizable: this.options.lastColumnResizable,
        })
      )
    }

    return plugins
  },

  addNodeView() {
    return ({ node, HTMLAttributes }) => {
      const cellMinWidth = calculateCellMinWidth(this.options.cellMinWidth)
      return new TiptapTableView(node, cellMinWidth, HTMLAttributes)
    }
  },
})