import { Box } from "@mui/material"
import { NodeViewWrapper } from "@tiptap/react"
import React from "react"
import { ImageAttributes } from "."
import { ImageViewerItem } from "../../../component/ImageViewer"

interface ReadonlyImageProps {
  attrs: ImageAttributes
}

const ReadonlyImage = ({
  attrs,
}: ReadonlyImageProps) => {
  return <NodeViewWrapper
    className={`image-wrapper`}
    as='span'
  >
    <Box component={'span'} sx={{
      position: 'relative',
      display: 'inline-flex',
      border: '1px solid',
      borderColor: 'divider',
      overflow: 'hidden',
      borderRadius: 'var(--mui-shape-borderRadius)',
      maxWidth: '100%',
    }}>
      <ImageViewerItem src={attrs.src}>
        <img
          src={attrs.src}
          width={attrs.width}
          style={{
            maxWidth: '100%',
            cursor: 'pointer',
          }}
        />
      </ImageViewerItem>
      {attrs.title && <>
        <br />
        <Box component='span' className="editor-image-title" sx={{
          position: 'relative',
          display: 'inline-block',
          fontSize: '0.75rem',
          color: 'text.tertiary',
        }}>{attrs.title}</Box>
      </>}
    </Box>
  </NodeViewWrapper>
}

export default ReadonlyImage