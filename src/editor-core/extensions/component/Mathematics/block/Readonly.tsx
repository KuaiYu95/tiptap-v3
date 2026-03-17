import { Box } from "@mui/material"
import { NodeViewWrapper } from "@tiptap/react"
import React from "react"
import { BlockMathAttributes } from "./index"

interface ReadonlyBlockMathProps {
  selected: boolean
  attrs: BlockMathAttributes
  mathRef: React.RefObject<HTMLDivElement>
}

const ReadonlyBlockMath = ({ attrs, selected, mathRef }: ReadonlyBlockMathProps) => {
  return (
    <NodeViewWrapper
      className={`mathematics-block-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
      data-drag-handle
    >
      <Box
        sx={{
          display: 'block',
          textAlign: 'center',
          py: 2,
          px: 1,
          borderRadius: 1,
          '&:hover': {
            bgcolor: 'action.hover'
          },
          '.katex-display': {
            m: 0,
          },
          transition: 'background-color 0.2s ease',
        }}
      >
        {attrs.latex ? (
          <div ref={mathRef} />
        ) : (
          <Box sx={{ color: 'error.main', fontStyle: 'italic' }}>
            Empty formula
          </Box>
        )}
      </Box>
    </NodeViewWrapper>
  )
}

export default ReadonlyBlockMath 
