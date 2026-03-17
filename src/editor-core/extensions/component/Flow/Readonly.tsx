import { Box } from "@mui/material"
import { NodeViewWrapper } from "@tiptap/react"
import React from "react"
import { FlowAttributes } from "."
import { useMermaidRender } from "./useMermaidRender"

interface ReadonlyFlowProps {
  attrs: FlowAttributes
  onError?: (error: Error) => void
}

const ReadonlyFlow = ({
  attrs,
  onError
}: ReadonlyFlowProps) => {
  const { svgContent, error } = useMermaidRender({
    code: attrs.code,
    onError,
    showLoading: false,
    idPrefix: 'mermaid-readonly',
  })

  if (!attrs.code || attrs.code.trim() === '') {
    return null
  }

  return (
    <NodeViewWrapper className="flow-wrapper">
      <Box
        sx={{
          textAlign: attrs.align || undefined,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'inline-block',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 'var(--mui-shape-borderRadius)',
            width: typeof attrs.width === 'string' && attrs.width.endsWith('%')
              ? attrs.width
              : typeof attrs.width === 'number'
                ? `${attrs.width}px`
                : typeof attrs.width === 'string' && attrs.width && !isNaN(parseFloat(attrs.width))
                  ? `${attrs.width}px`
                  : attrs.width || '100%',
            height: 'auto',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              minHeight: error ? 'auto' : '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.default',
              borderRadius: 'var(--mui-shape-borderRadius)',
            }}
          >
            {error && (
              <Box
                sx={{
                  color: 'error.main',
                  padding: '20px',
                  textAlign: 'center',
                  fontSize: '14px',
                  whiteSpace: 'pre-line',
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                }}
              >
                {error}
              </Box>
            )}
            {svgContent && !error && (
              <Box
                dangerouslySetInnerHTML={{ __html: svgContent }}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& svg': {
                    maxWidth: '100%',
                    height: 'auto',
                  }
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </NodeViewWrapper>
  )
}

export default ReadonlyFlow

