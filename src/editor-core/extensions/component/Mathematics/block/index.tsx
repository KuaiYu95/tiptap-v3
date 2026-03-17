import { FloatingPopover } from "../../../../../components/FloatingPopover"
import { FunctionsIcon } from "../../../../../components/Icons"
import { EditorFnProps } from "../../../../../types"
import { Box } from "@mui/material"
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react"
import React, { useEffect, useRef, useState } from "react"
import ReadonlyBlockMath from "./Readonly"
import { createMathAttributes, MathAttributes, MathEditorPopover, renderMathToElement } from "../shared"

export type BlockMathAttributes = MathAttributes

export const MathematicsBlockViewWrapper: React.FC<NodeViewProps & EditorFnProps> = ({
  editor,
  node,
  updateAttributes,
  selected,
  onError,
}) => {
  const attrs = node.attrs as BlockMathAttributes
  const mathRef = useRef<HTMLDivElement>(null)

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
      displayMode: true,
      onError,
    })
  }, [attrs.latex, onError])

  if (!editor.isEditable) {
    return <ReadonlyBlockMath mathRef={mathRef} attrs={attrs} selected={selected} />
  }

  return (
    <NodeViewWrapper
      className={`mathematics-block-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
      data-drag-handle
    >
      {!attrs.latex ? (
        <Box
          onClick={handleShowPopover}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 'var(--mui-shape-borderRadius)',
            px: 2,
            py: 1.5,
            fontSize: '0.875rem',
            color: 'text.secondary',
            bgcolor: 'action.default',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover'
            },
            '&:active': {
              bgcolor: 'action.selected',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <FunctionsIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
          <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            添加数学公式
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'block',
            textAlign: 'center',
            py: 1.5,
            px: 2,
            borderRadius: 'var(--mui-shape-borderRadius)',
            bgcolor: 'transparent',
            cursor: 'pointer',
            '.katex-display': {
              m: 0,
            },
            '&:hover': {
              bgcolor: 'action.hover'
            },
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}
          onClick={handleShowPopover}
        >
          <div ref={mathRef} />
        </Box>
      )}
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
          multiline
          placeholder="输入 LaTeX 公式，例如：\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}"
        />
      </FloatingPopover>
    </NodeViewWrapper>
  )
}

export default MathematicsBlockViewWrapper
