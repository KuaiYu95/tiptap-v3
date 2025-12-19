import { MindMapIcon } from '@ctzhian/tiptap/component/Icons'
import { EditorFnProps } from '@ctzhian/tiptap/type'
import { Box, Stack } from '@mui/material'
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import React, { useState } from 'react'
import { getImageDimensionsFromFile } from '../Image'
import ExcalidrawModal from './Modal'

const ExcalidrawView: React.FC<NodeViewProps & EditorFnProps> = ({
  editor,
  node,
  selected,
  getPos,
  onUpload,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    if (editor.isEditable) {
      setIsModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSave = async (file: File) => {
    try {
      let imageUrl: string
      if (onUpload) {
        imageUrl = await onUpload(file)
        if (!imageUrl) {
          return
        }
      } else {
        imageUrl = URL.createObjectURL(file)
      }

      // 获取图片实际宽度
      let imageWidth: number = 760 // 默认宽度
      try {
        const dimensions = await getImageDimensionsFromFile(file)
        imageWidth = Math.min(dimensions.width, 760)
      } catch (error) {
        console.warn('Failed to get image dimensions, using default width', error)
      }

      const pos = typeof getPos === 'function' ? getPos() : null
      if (pos !== null && pos !== undefined && typeof pos === 'number') {
        const nodePos = pos
        const nodeSize = node.nodeSize
        const imageNodeType = editor.schema.nodes.image
        if (imageNodeType) {
          const imageNode = imageNodeType.create({
            src: imageUrl,
            width: imageWidth,
          })

          editor.chain()
            .focus()
            .command(({ tr }) => {
              tr.replaceWith(nodePos, nodePos + nodeSize, imageNode)
              return true
            })
            .run()
        } else {
          editor.chain().focus().setImage({
            src: imageUrl,
            width: imageWidth
          }).run()
        }
      } else {
        editor.chain().focus().setImage({
          src: imageUrl,
          width: imageWidth
        }).run()
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save and insert image', error)
    }
  }

  if (!editor.isEditable) {
    return null
  }

  return (
    <>
      <NodeViewWrapper
        className={`excalidraw-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
        data-drag-handle
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={2}
          onClick={handleOpenModal}
          sx={{
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 'var(--mui-shape-borderRadius)',
            px: 2,
            py: 1.5,
            minWidth: 200,
            textAlign: 'center',
            color: 'text.secondary',
            bgcolor: 'action.default',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover'
            },
            '&:active': {
              bgcolor: 'action.selected',
            },
          }}
        >
          <MindMapIcon sx={{ fontSize: '1rem' }} />
          <Box sx={{ fontSize: '0.875rem', position: 'relative', flexGrow: 1, textAlign: 'left' }}>
            点击此处嵌入 Excalidraw 绘图
          </Box>
        </Stack>
      </NodeViewWrapper>
      {isModalOpen && (
        <ExcalidrawModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </>
  )
}

export default ExcalidrawView
