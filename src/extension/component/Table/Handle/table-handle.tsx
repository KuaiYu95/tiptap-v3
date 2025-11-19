import type { Node } from "@tiptap/pm/model"
import type { Editor } from "@tiptap/react"
import type { ComponentType } from "react"
import React, { useCallback, useMemo, useState } from "react"
import { createPortal } from "react-dom"

import {
  colDragStart,
  dragEnd,
  rowDragStart,
} from "../../../node/TableHandler/plugin"

// --- Hooks ---
import type { Orientation } from "@ctzhian/tiptap/contants/table"
import { useTableHandleState } from "@ctzhian/tiptap/hook/useTableHandlerState"
import { useTiptapEditor } from "@ctzhian/tiptap/hook/useTiptapEditor"
import { useTableHandlePositioning } from "./use-table-handle-positioning"

export interface TableHandleButtonProps {
  editor: Editor
  orientation: Orientation
  index?: number
  tablePos?: number
  tableNode?: Node
  onToggleOtherHandle?: (visible: boolean) => void
  onOpenChange?: (open: boolean) => void
  dragStart?: (e: React.DragEvent) => void
}

export interface TableHandleProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null

  /**
   * Custom component to render for row handles.
   * If not provided, uses a default button.
   */
  rowButton?: ComponentType<TableHandleButtonProps>

  /**
   * Custom component to render for column handles.
   * If not provided, uses a default button.
   */
  columnButton?: ComponentType<TableHandleButtonProps>
}

/**
 * Default table handle button component
 */
const DefaultTableHandleButton: React.FC<TableHandleButtonProps> = ({
  editor,
  orientation,
  onToggleOtherHandle,
  onOpenChange,
  dragStart,
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      setIsDragging(true)
      if (dragStart) {
        dragStart(e)
      } else {
        const event = {
          dataTransfer: e.dataTransfer,
          currentTarget: e.currentTarget,
          clientX: e.clientX,
          clientY: e.clientY,
        }
        if (orientation === "row") {
          rowDragStart(event)
        } else {
          colDragStart(event)
        }
      }
    },
    [dragStart, orientation]
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    dragEnd()
  }, [])

  const handleClick = useCallback(() => {
    if (!editor) return
    onOpenChange?.(true)
    editor.commands.freezeHandles()
    onToggleOtherHandle?.(false)
  }, [editor, onOpenChange, onToggleOtherHandle])

  const baseStyle: React.CSSProperties = {
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--ct-tt-table-handle-bg-color, rgba(0, 0, 0, 0.05))",
    borderRadius: "var(--ct-tt-radius-lg, 4px)",
    cursor: "grab",
    transition: "background-color 0.2s",
    boxSizing: "border-box",
  }

  const orientationStyle: React.CSSProperties =
    orientation === "row"
      ? {
        width: "0.5rem",
        height: "var(--table-handle-ref-height, 100%)",
        flexDirection: "column",
      }
      : {
        height: "0.5rem",
        width: "var(--table-handle-ref-width, 100%)",
        flexDirection: "row",
      }

  const draggingStyle: React.CSSProperties = isDragging
    ? {
      cursor: "grabbing",
      backgroundColor: "var(--ct-tt-table-handle-bg-color, rgba(0, 0, 0, 0.12))",
    }
    : {}

  const dotStyle: React.CSSProperties = {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "var(--ct-tt-table-handle-dot-color, rgba(0, 0, 0, 0.4))",
    ...(orientation === "row"
      ? { margin: "2px 0" }
      : { margin: "0 2px" }),
  }

  return (
    <button
      style={{ ...baseStyle, ...orientationStyle, ...draggingStyle }}
      draggable={true}
      aria-label={orientation === "row" ? "Row handle" : "Column handle"}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      type="button"
    >
      <div style={dotStyle} />
    </button>
  )
}

/**
 * Main table handle component that manages the positioning and rendering
 * of table row/column handles.
 *
 * This component can be extended with custom row and column buttons.
 */
export function TableHandle({
  editor: providedEditor,
  rowButton: CustomRowButton,
  columnButton: CustomColumnButton,
}: TableHandleProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const state = useTableHandleState({ editor })

  const [isRowVisible, setIsRowVisible] = useState(true)
  const [isColumnVisible, setIsColumnVisible] = useState(true)
  const [menuOpen, setMenuOpen] = useState<null | "row" | "column">(null)

  const draggingState = useMemo(() => {
    if (!state?.draggingState) return undefined

    return {
      draggedCellOrientation: state.draggingState.draggedCellOrientation,
      mousePos: state.draggingState.mousePos,
      initialOffset: state.draggingState.initialOffset,
    }
  }, [state?.draggingState])

  const { rowHandle, colHandle } = useTableHandlePositioning(
    state?.show || false,
    state?.referencePosCell || null,
    state?.referencePosTable || null,
    draggingState
  )

  const toggleRowVisibility = useCallback((visible: boolean) => {
    setIsRowVisible(visible)
  }, [])

  const toggleColumnVisibility = useCallback((visible: boolean) => {
    setIsColumnVisible(visible)
  }, [])

  const handleMenuOpenChange = useCallback(
    (type: "row" | "column", open: boolean) => {
      setMenuOpen(open ? type : null)
      if (!open && editor) {
        editor.commands.unfreezeHandles()
        if (type === "row") {
          toggleColumnVisibility(true)
        } else {
          toggleRowVisibility(true)
        }
      }
    },
    [editor, toggleRowVisibility, toggleColumnVisibility]
  )

  if (!editor || !state || !state.widgetContainer) return null

  const hasValidRowIndex = typeof state.rowIndex === "number"
  const hasValidColIndex = typeof state.colIndex === "number"

  const shouldShowRow =
    (isRowVisible && rowHandle.isMounted && hasValidRowIndex) ||
    menuOpen === "row"

  const shouldShowColumn =
    (isColumnVisible && colHandle.isMounted && hasValidColIndex) ||
    menuOpen === "column"

  const RowButton = CustomRowButton || DefaultTableHandleButton
  const ColumnButton = CustomColumnButton || DefaultTableHandleButton

  return (
    <>
      {shouldShowRow &&
        createPortal(
          <div ref={rowHandle.ref} style={rowHandle.style}>
            <RowButton
              editor={editor}
              orientation="row"
              index={state.rowIndex}
              tablePos={state.blockPos}
              tableNode={state.block}
              onToggleOtherHandle={toggleColumnVisibility}
              onOpenChange={(open) => handleMenuOpenChange("row", open)}
            />
          </div>,
          state.widgetContainer
        )}

      {shouldShowColumn &&
        createPortal(
          <div ref={colHandle.ref} style={colHandle.style}>
            <ColumnButton
              editor={editor}
              orientation="column"
              index={state.colIndex}
              tablePos={state.blockPos}
              tableNode={state.block}
              onToggleOtherHandle={toggleRowVisibility}
              onOpenChange={(open) => handleMenuOpenChange("column", open)}
            />
          </div>,
          state.widgetContainer
        )}
    </>
  )
}

TableHandle.displayName = "TableHandle"

