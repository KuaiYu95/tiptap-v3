import { Box } from "@mui/material"
import { NodeViewWrapper } from "@tiptap/react"
import React from "react"
import { VideoAttributes } from "."

interface ReadonlyVideoProps {
  attrs: VideoAttributes
  onError?: (error: Error) => void
}

const ReadonlyVideo = ({
  attrs,
  onError
}: ReadonlyVideoProps) => {
  return <NodeViewWrapper
    className={`video-wrapper`}
  >
    <Box sx={{
      textAlign: attrs.align || undefined,
    }}>
      <video
        src={attrs.src}
        poster={attrs.poster || undefined}
        controls={attrs.controls}
        autoPlay={attrs.autoplay}
        loop={attrs.loop}
        muted={attrs.muted}
        width={attrs.width || undefined}
        style={{
          maxWidth: '100%',
          cursor: 'pointer',
          height: 'auto',
          display: 'inline-block'
        }}
        onError={(e) => {
          onError?.(e as unknown as Error)
        }}
      />
    </Box>
  </NodeViewWrapper>
}

export default ReadonlyVideo