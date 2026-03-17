import { MovieLineIcon, UploadCloud2LineIcon } from "../../../components/Icons"
import { EditorFnProps } from "../../../types"
import { Button, CircularProgress, Stack, TextField } from "@mui/material"
import { NodeViewWrapper } from "@tiptap/react"
import React, { useState } from "react"
import { InsertPopover, InsertTabsHeader, InsertTriggerCard, useInsertPopover } from "../../../editor-core/extensions/component/shared/insert-popover"
import { VideoAttributes } from "."

type InsertVideoProps = {
  selected: boolean
  attrs: VideoAttributes
  updateAttributes: (attrs: VideoAttributes) => void
} & EditorFnProps

const InsertVideo = ({
  selected,
  attrs,
  updateAttributes,
  onUpload,
  onError,
  onValidateUrl
}: InsertVideoProps) => {
  const [editSrc, setEditSrc] = useState(attrs.src || '')
  const [insertType, setInsertType] = useState<'upload' | 'link'>(onUpload ? 'upload' : 'link')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { anchorEl, triggerRef, openFromEvent, close, isOpen } = useInsertPopover<HTMLDivElement>()
  const handleChangeInsertType = (event: React.SyntheticEvent, newValue: string) => setInsertType(newValue as 'upload' | 'link')

  const handleUploadVideo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploading(true)
      setUploadProgress(0)
      close()
      try {
        const url = await onUpload?.(file, (event) => {
          setUploadProgress(Math.round(event.progress * 100))
        })
        if (url) {
          setEditSrc(url)
          updateAttributes({
            src: url,
            width: attrs.width,
            controls: attrs.controls,
            autoplay: attrs.autoplay,
            loop: attrs.loop,
            muted: attrs.muted,
            poster: attrs.poster,
            align: attrs.align,
          })
        }
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
      let validatedUrl = editSrc.trim()
      if (onValidateUrl) {
        validatedUrl = await Promise.resolve(onValidateUrl(validatedUrl, 'video'))
      }
      updateAttributes({
        src: validatedUrl,
        width: attrs.width,
        controls: attrs.controls,
        autoplay: attrs.autoplay,
        loop: attrs.loop,
        muted: attrs.muted,
        poster: attrs.poster,
        align: attrs.align,
      })
      close()
    } catch (error) {
      onError?.(error as Error)
    }
  }

  return <NodeViewWrapper
    className={`video-wrapper`}
    data-drag-handle
  >
    <InsertTriggerCard
      ref={triggerRef}
      icon={<MovieLineIcon sx={{ fontSize: '1rem', flexShrink: 0 }} />}
      text={uploading ? '视频上传中...' : '点击此处嵌入或粘贴视频链接'}
      onClick={openFromEvent}
      uploading={uploading}
      uploadProgress={uploadProgress}
      dragHandle
    />
    <InsertPopover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={close}
    >
      <InsertTabsHeader value={insertType} onChange={handleChangeInsertType} />
      {insertType === 'upload' ? <Stack alignItems={'center'} gap={2} sx={{ p: 2 }}>
        <Button
          variant="contained"
          component="label"
          disabled={!onUpload || uploading}
          fullWidth
          startIcon={uploading ? <CircularProgress size={20} /> : <UploadCloud2LineIcon sx={{ fontSize: 18 }} />}
        >
          <input
            type="file"
            hidden
            multiple={false}
            accept="video/*"
            onChange={handleUploadVideo}
          />
          {uploading ? '视频文件上传中...' : '视频文件'}
        </Button>
      </Stack> : <Stack gap={2} sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          value={editSrc}
          onChange={(e) => setEditSrc(e.target.value)}
          placeholder="输入视频文件的 URL"
        />
        <Button variant="contained" fullWidth onClick={handleInsertLink}>
          嵌入视频
        </Button>
      </Stack>}
    </InsertPopover>
  </NodeViewWrapper>
}

export default InsertVideo
