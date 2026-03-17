import { Box } from "@mui/material"
import { NodeViewWrapper } from "@tiptap/react"
import React from "react"
import { InlineMathAttributes } from "./index"

interface ReadonlyInlineMathProps {
  selected: boolean
  attrs: InlineMathAttributes
  mathRef: React.RefObject<HTMLSpanElement>
}

const ReadonlyInlineMath = ({ attrs, selected, mathRef }: ReadonlyInlineMathProps) => {
  return <NodeViewWrapper
    className={`mathematics-inline-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
  >
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 0.5,
        py: 0.25,
        borderRadius: 0.5,
        '&:hover': {
          bgcolor: 'action.hover'
        },
        transition: 'background-color 0.2s ease',
      }}
    >
      {attrs.latex ? (
        <span ref={mathRef} />
      ) : (
        <Box component="span" sx={{ color: 'error.main', fontStyle: 'italic' }}>
          Empty formula
        </Box>
      )}
    </Box>
  </NodeViewWrapper>
}

export default ReadonlyInlineMath
