import { Box } from "@mui/material"
import React from "react"
import { useMermaidRender } from "./useMermaidRender"


interface FlowDiagramProps {
  code: string
  onError?: (error: Error) => void
}

const FlowDiagram: React.FC<FlowDiagramProps> = ({ code, onError }) => {
  const { svgContent, error, loading } = useMermaidRender({
    code,
    onError,
    showLoading: true,
    idPrefix: 'mermaid',
  })

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: loading ? '100px' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& svg': {
          maxWidth: '100%',
          height: 'auto',
        }
      }}
    >
      {loading && !error && (
        <Box sx={{ color: 'text.secondary', fontSize: '14px' }}>正在渲染...</Box>
      )}
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
          }}
        />
      )}
    </Box>
  )
}

export default FlowDiagram