import { EditorFnProps } from "../../../types"
import { Box, Button, Stack } from "@mui/material"
import { NodeViewWrapper } from "@tiptap/react"
import React, { useRef, useState } from "react"
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import { ImageAttributes } from "."

import 'react-image-crop/dist/ReactCrop.css'

type CropImageProps = {
  selected: boolean
  attrs: ImageAttributes
  onConfirm: (imageUrl: string) => void
  onCancel: () => void
} & EditorFnProps

const CropImage = ({
  selected,
  attrs,
  onConfirm,
  onCancel,
  onUpload,
  onError
}: CropImageProps) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [isUploading, setIsUploading] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const onImageLoad = () => {
    setCrop({
      unit: '%',
      width: 100,
      height: 100,
      x: 0,
      y: 0
    })
  }

  const getCroppedFile = (): Promise<File | null> => {
    return new Promise((resolve) => {
      if (!completedCrop || !imgRef.current) {
        resolve(null)
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(null)
        return
      }

      const image = imgRef.current
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      canvas.width = completedCrop.width
      canvas.height = completedCrop.height

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      )

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
          resolve(file)
        } else {
          resolve(null)
        }
      }, 'image/jpeg', 0.95)
    })
  }

  const getCroppedDataUrl = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!completedCrop || !imgRef.current) {
        resolve('')
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve('')
        return
      }

      const image = imgRef.current
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      canvas.width = completedCrop.width
      canvas.height = completedCrop.height

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      )

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
      resolve(dataUrl)
    })
  }

  const handleConfirm = async () => {
    setIsUploading(true)

    try {
      if (onUpload) {
        const croppedFile = await getCroppedFile()
        if (croppedFile) {
          const uploadedUrl = await onUpload(croppedFile)
          onConfirm(uploadedUrl)
        }
      } else {
        const croppedDataUrl = await getCroppedDataUrl()
        if (croppedDataUrl) {
          onConfirm(croppedDataUrl)
        }
      }
    } catch (error) {
      onError?.(error as Error)
      setIsUploading(false)
      return
    }

    setIsUploading(false)
  }

  return (
    <NodeViewWrapper
      className={`image-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
    >
      <Box
        component={'span'}
        sx={{
          position: 'relative',
          display: 'inline-block',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 'var(--mui-shape-borderRadius)',
          p: '0.25rem',
          bgcolor: 'background.paper',
          maxWidth: '100%'
        }}
      >
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          style={{ maxWidth: '100%' }}
        >
          <img
            ref={imgRef}
            src={attrs.src}
            width={attrs.width}
            crossOrigin="anonymous"
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
            onLoad={onImageLoad}
            onError={(e) => {
              onError?.(e as unknown as Error)
            }}
          />
        </ReactCrop>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 1,
            justifyContent: 'center'
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={handleConfirm}
            disabled={!completedCrop || isUploading}
          >
            {isUploading ? '上传中...' : '确认裁切'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onCancel}
            disabled={isUploading}
          >
            取消
          </Button>
        </Stack>
      </Box>
    </NodeViewWrapper>
  )
}

export default CropImage
