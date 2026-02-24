import { FloatingPopover } from "@ctzhian/tiptap/component/FloatingPopover"
import { ImageLineIcon } from "@ctzhian/tiptap/component/Icons"
import { EditorFnProps } from "@ctzhian/tiptap/type"
import { Box, Button, CircularProgress, Stack, Tab, Tabs, TextField } from "@mui/material"
import { NodeViewWrapper } from "@tiptap/react"
import React, { useState } from "react"
import { ImageAttributes, getImageDimensions, getImageDimensionsFromFile } from "."

type InsertImageProps = {
  selected: boolean
  attrs: ImageAttributes
  updateAttributes: (attrs: ImageAttributes) => void
} & EditorFnProps

const InsertImage = ({
  selected,
  attrs,
  updateAttributes,
  onUpload,
  onUploadImgUrl,
  onError,
  onValidateUrl
}: InsertImageProps) => {
  const [editSrc, setEditSrc] = useState(attrs.src || '')
  const [editTitle, setEditTitle] = useState(attrs.title || '')
  const [insertType, setInsertType] = useState<'upload' | 'link'>(onUpload ? 'upload' : 'link')
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleShowPopover = (event: React.MouseEvent<HTMLDivElement>) => setAnchorEl(event.currentTarget)
  const handleClosePopover = () => setAnchorEl(null)
  const handleChangeInsertType = (event: React.SyntheticEvent, newValue: string) => setInsertType(newValue as 'upload' | 'link')

  // 更新图片属性，包含自动获取的宽度
  const updateImageAttributes = async (src: string, title?: string) => {
    try {
      const dimensions = await getImageDimensions(src)
      updateAttributes({
        src,
        width: dimensions.width,
        ...(title ? { title } : {}),
      })
    } catch (error) {
      updateAttributes({
        src,
        width: attrs.width || 400, // 默认宽度
        ...(title ? { title } : {}),
      })
    }
  }

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onUpload) {
      setUploading(true)
      setUploadProgress(0)
      handleClosePopover()

      try {
        // 先获取文件尺寸，避免重复加载
        const dimensions = await getImageDimensionsFromFile(file)

        const url = await onUpload(file, (event) => {
          setUploadProgress(Math.round(event.progress * 100))
        })

        setEditSrc(url)

        // 直接使用已获取的尺寸，无需再次加载图片
        updateAttributes({
          src: url,
          width: dimensions.width,
        })

      } catch (error) {
        onError?.(error as Error)
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    }
  }

  const handleInsertLink = async () => {
    if (!editSrc.trim()) return
    try {
      let finalUrl = editSrc.trim()
      if (onValidateUrl) {
        finalUrl = await Promise.resolve(onValidateUrl(finalUrl, 'image'))
      }
      // 若为图片链接且有 onUploadImgUrl，交由后端上传并获取新 URL
      if (onUploadImgUrl && (finalUrl.startsWith('http://') || finalUrl.startsWith('https://') || finalUrl.startsWith('//'))) {
        setUploading(true)
        handleClosePopover()
        try {
          const abortController = new AbortController()
          finalUrl = await onUploadImgUrl(finalUrl, abortController.signal)
          await updateImageAttributes(finalUrl, editTitle.trim())
        } finally {
          setUploading(false)
        }
      } else {
        await updateImageAttributes(finalUrl, editTitle.trim())
        handleClosePopover()
      }
    } catch (error) {
      onError?.(error as Error)
    }
  }

  return <>
    <NodeViewWrapper
      className={`image-wrapper`}
    >
      <Stack
        direction={'row'}
        alignItems={'center'}
        gap={2}
        onClick={!uploading ? handleShowPopover : undefined}
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
          ...(!uploading ? {
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover'
            },
            '&:active': {
              bgcolor: 'action.selected',
            },
          } : {
            "&::before": {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${uploadProgress}%`,
              bgcolor: 'primary.main',
              opacity: 0.1,
              transition: 'width 0.3s ease',
            }
          }),
        }}
      >
        <ImageLineIcon sx={{ fontSize: '1rem', position: 'relative', flexShrink: 0 }} />
        <Box sx={{ fontSize: '0.875rem', position: 'relative', flexGrow: 1, textAlign: 'left' }}>
          {uploading ? '图片上传中...' : '点击此处嵌入或粘贴图片链接'}
        </Box>
        {uploading && <Box sx={{ fontSize: 12, fontWeight: 'bold', color: 'primary.main', position: 'relative', flexShrink: 0 }}>
          {uploadProgress}%
        </Box>}
      </Stack>
    </NodeViewWrapper>
    <FloatingPopover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleClosePopover}
      placement="bottom"
    >
      <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} sx={{ width: 350, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tabs value={insertType} onChange={handleChangeInsertType} sx={{
          borderRadius: '0 !important',
          height: 'auto !important',
          padding: '0 !important',
        }}>
          <Tab label="上传" value="upload" />
          <Tab label="嵌入链接" value="link" />
        </Tabs>
      </Stack>
      {insertType === 'upload' ? (
        <Stack alignItems={'center'} gap={2} sx={{ p: 2 }}>
          <Button
            variant="contained"
            component="label"
            disabled={!onUpload || uploading}
            fullWidth
            startIcon={uploading ? <CircularProgress size={20} /> : <ImageLineIcon sx={{ fontSize: 18 }} />}
          >
            <input
              type="file"
              hidden
              multiple={false}
              accept="image/*"
              onChange={handleUploadImage}
            />
            {uploading ? '图片上传中...' : '选择图片文件'}
          </Button>
        </Stack>
      ) : (
        <Stack gap={2} sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            value={editSrc}
            onChange={(e) => setEditSrc(e.target.value)}
            placeholder="输入图片的 URL"
            label="图片链接"
          />
          <TextField
            fullWidth
            size="small"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="输入图片描述（可选）"
            label="图片描述"
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleInsertLink}
            disabled={!editSrc.trim()}
          >
            嵌入图片
          </Button>
        </Stack>
      )}
    </FloatingPopover>
  </>
}

export default InsertImage
