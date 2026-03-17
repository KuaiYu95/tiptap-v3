import { Box } from '@mui/material'
import { NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export type IframeAttributes = {
  src: string
  width: number | string
  height: number
  align: 'left' | 'center' | 'right' | null
}

const ReadonlyIframe = ({ attrs }: { attrs: IframeAttributes }) => {
  return (
    <NodeViewWrapper className={`iframe-wrapper`}>
      <Box sx={{
        textAlign: attrs.align || undefined,
      }}>
        <iframe
          src={attrs.src}
          width={typeof attrs.width === 'number' ? attrs.width : undefined}
          height={attrs.height}
          style={{
            display: 'inline-block',
            border: 0,
            width: typeof attrs.width === 'string' && attrs.width.endsWith('%') ? attrs.width : undefined,
            maxWidth: '100%'
          }}
          frameBorder="0"
          allowFullScreen
        />
      </Box>
    </NodeViewWrapper>
  )
}

export default ReadonlyIframe


