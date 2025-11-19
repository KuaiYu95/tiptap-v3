import { clamp } from "@ctzhian/tiptap/contants/table"
import { useEffect, useMemo, useState } from "react"

type Orientation = "row" | "col" | "cell"

type DraggingState = {
  draggedCellOrientation: Exclude<Orientation, "cell">
  mousePos: number
  initialOffset?: number
}

/**
 * Creates a DOMRect for row handle positioning
 */
function makeRowRect(
  cell: DOMRect,
  table: DOMRect,
  dragging?: DraggingState
): DOMRect {
  if (dragging?.draggedCellOrientation === "row") {
    // Apply the initial offset to maintain handle position
    const adjustedY = dragging.mousePos + (dragging.initialOffset ?? 0)
    const clampedY = clamp(adjustedY, table.y, table.bottom - cell.height)
    return new DOMRect(table.x, clampedY, table.width, cell.height)
  }
  return new DOMRect(table.x, cell.y, table.width, cell.height)
}

/**
 * Creates a DOMRect for column handle positioning
 */
function makeColRect(
  cell: DOMRect,
  table: DOMRect,
  dragging?: DraggingState
): DOMRect {
  if (dragging?.draggedCellOrientation === "col") {
    // Apply the initial offset to maintain handle position
    const adjustedX = dragging.mousePos + (dragging.initialOffset ?? 0)
    const clampedX = clamp(adjustedX, table.x, table.right - cell.width)
    return new DOMRect(clampedX, table.y, cell.width, table.height)
  }
  return new DOMRect(cell.x, table.y, cell.width, table.height)
}

/**
 * Creates a DOMRect for cell handle positioning
 */
function makeCellRect(cell: DOMRect): DOMRect {
  return new DOMRect(cell.x, cell.y, cell.width, 0)
}

/**
 * Factory function to create DOMRect based on orientation
 */
function rectFactory(
  orientation: Orientation,
  cell: DOMRect,
  table: DOMRect,
  dragging?: DraggingState
): DOMRect {
  switch (orientation) {
    case "row":
      return makeRowRect(cell, table, dragging)
    case "col":
      return makeColRect(cell, table, dragging)
    case "cell":
    default:
      return makeCellRect(cell)
  }
}

/**
 * Hook for positioning individual table handles
 */
export function useTableHandlePosition(
  orientation: Orientation,
  show: boolean,
  referencePosCell: DOMRect | null,
  referencePosTable: DOMRect | null,
  draggingState?: DraggingState
): {
  isMounted: boolean
  ref: (node: HTMLElement | null) => void
  style: React.CSSProperties
} {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [style, setStyle] = useState<React.CSSProperties>({
    display: "none",
  })

  useEffect(() => {
    if (!show || !referencePosCell || !referencePosTable || !element) {
      setStyle({ display: "none" })
      return
    }

    const updatePosition = () => {
      if (!referencePosCell || !referencePosTable) return

      const rect = rectFactory(
        orientation,
        referencePosCell,
        referencePosTable,
        draggingState
      )

      const offset = 12

      if (orientation === "row") {
        // Position to the left of the row
        setStyle({
          position: "fixed",
          top: `${rect.y}px`,
          left: `${rect.x - offset}px`,
          width: "0.5rem",
          height: `${rect.height}px`,
          display: "flex",
          zIndex: 1000,
          // Set CSS variables for button styling
          "--table-handle-ref-height": `${rect.height}px`,
        } as React.CSSProperties)
      } else if (orientation === "col") {
        // Position above the column
        setStyle({
          position: "fixed",
          top: `${rect.y - offset}px`,
          left: `${rect.x}px`,
          width: `${rect.width}px`,
          height: "0.5rem",
          display: "flex",
          zIndex: 1000,
          // Set CSS variables for button styling
          "--table-handle-ref-width": `${rect.width}px`,
        } as React.CSSProperties)
      } else {
        // Cell handle
        setStyle({
          position: "fixed",
          top: `${rect.bottom}px`,
          left: `${rect.right}px`,
          width: "0px",
          height: "0px",
          display: "none",
          zIndex: 1000,
        })
      }
    }

    updatePosition()

    // Update on scroll/resize
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)

    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [show, referencePosCell, referencePosTable, orientation, draggingState, element])

  return useMemo(
    () => ({
      isMounted: show && !!referencePosCell && !!referencePosTable,
      ref: setElement,
      style,
    }),
    [show, referencePosCell, referencePosTable, style]
  )
}

/**
 * Hook for managing positioning of all table handles (row, column, and cell)
 *
 * @param show - Whether handles should be shown
 * @param referencePosCell - The bounding rect of the current cell
 * @param referencePosTable - The bounding rect of the table
 * @param draggingState - Current dragging state if any
 * @returns Positioning data for all handle types
 */
export function useTableHandlePositioning(
  show: boolean,
  referencePosCell: DOMRect | null,
  referencePosTable: DOMRect | null,
  draggingState?: DraggingState
) {
  const rowHandle = useTableHandlePosition(
    "row",
    show,
    referencePosCell,
    referencePosTable,
    draggingState
  )

  const colHandle = useTableHandlePosition(
    "col",
    show,
    referencePosCell,
    referencePosTable,
    draggingState
  )

  const cellHandle = useTableHandlePosition(
    "cell",
    show,
    referencePosCell,
    referencePosTable,
    draggingState
  )

  return useMemo(
    () => ({ rowHandle, colHandle, cellHandle }),
    [rowHandle, colHandle, cellHandle]
  )
}

