import { FloatingPopover } from "../../../../../components/FloatingPopover"
import { SquareRootIcon } from "../../../../../components/Icons"
import { EditorFnProps } from "../../../../../types"
import { Box } from "@mui/material"
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react"
import React, { useEffect, useRef, useState } from "react"
import ReadonlyInlineMath from "./Readonly"
import { createMathAttributes, MathAttributes, MathEditorPopover, renderMathToElement } from "../shared"

export type InlineMathAttributes = MathAttributes

export const MathematicsInlineViewWrapper: React.FC<NodeViewProps & EditorFnProps> = ({
  editor,
  node,
  updateAttributes,
  selected,
  onError,
}) => {
  const attrs = node.attrs as InlineMathAttributes
  const mathRef = useRef<HTMLSpanElement>(null)

  const [editLatex, setEditLatex] = useState(attrs.latex || '')
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)

  const handleShowPopover = (event: React.MouseEvent<HTMLDivElement>) => {
    setEditLatex(attrs.latex || '')
    setAnchorEl(event.currentTarget)
  }
  const handleClosePopover = () => setAnchorEl(null)
  const handleInsertFormula = () => {
    if (!editLatex.trim()) return
    updateAttributes(createMathAttributes(attrs, {
      latex: editLatex.trim(),
    }))
    handleClosePopover()
  }

  useEffect(() => {
    renderMathToElement({
      latex: attrs.latex,
      element: mathRef.current,
      displayMode: false,
      onError,
    })
  }, [attrs.latex, onError])

  if (!editor.isEditable) {
    return <ReadonlyInlineMath mathRef={mathRef} attrs={attrs} selected={selected} />
  }

  return (
    <NodeViewWrapper
      className={`mathematics-inline-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
      as="span"
    >
      {!attrs.latex ? <Box
        component="span"
        onClick={handleShowPopover}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 'var(--mui-shape-borderRadius)',
          px: 2,
          py: 1.5,
          fontSize: 14,
          color: 'text.secondary',
          bgcolor: 'action.default',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover'
          },
          '&:active': {
            bgcolor: 'action.selected',
          },
          transition: 'background-color 0.2s ease',
        }}
      >
        <SquareRootIcon sx={{ fontSize: '1rem', flexShrink: 0 }} />
        <Box component="span">
          添加数学公式
        </Box>
      </Box> : <Box
        component="span"
        sx={{
          display: 'inline-block',
          cursor: 'pointer',
          position: 'relative',
          px: 0.5,
          py: 0.25,
          borderRadius: 'var(--mui-shape-borderRadius)',
          bgcolor: 'transparent',
          '&:hover': {
            bgcolor: 'action.hover'
          },
          transition: 'background-color 0.2s ease',
        }}
        onClick={handleShowPopover}
      >
        <Box component="span" ref={mathRef} />
      </Box>}
      <FloatingPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        placement="bottom"
      >
        <MathEditorPopover
          value={editLatex}
          onChange={setEditLatex}
          onSubmit={handleInsertFormula}
          placeholder="输入 LaTeX 公式，例如：x^2 + y^2 = z^2"
        />
      </FloatingPopover>
    </NodeViewWrapper>
  )
}

export default MathematicsInlineViewWrapper
