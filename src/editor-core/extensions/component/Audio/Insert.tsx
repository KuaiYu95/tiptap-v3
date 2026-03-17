import { Attachment2Icon, UploadCloud2LineIcon } from "../../../../components/Icons"
import { EditorFnProps } from "../../../../types"
import { Button, CircularProgress, IconButton, Stack, TextField } from "@mui/material"
import { NodeViewWrapper } from "@tiptap/react"
import React, { useState } from "react"
import { InsertPopover, InsertTabsHeader, InsertTriggerCard, useInsertPopover } from "../shared/insert-popover"
import { AudioAttributes, createAudioAttributes } from "./shared"
import { useAudioUploadFields } from "./use-audio-upload-fields"

type InsertAudioProps = {
  selected: boolean
  attrs: AudioAttributes
  updateAttributes: (attrs: AudioAttributes) => void
} & EditorFnProps

const InsertAudio = ({
  selected,
  attrs,
  updateAttributes,
  onUpload,
  onError,
  onValidateUrl
}: InsertAudioProps) => {
  const [editSrc, setEditSrc] = useState(attrs.src || '')
  const [editTitle, setEditTitle] = useState(attrs.title || '')
  const [editPoster, setEditPoster] = useState(attrs.poster || '')
  const [insertType, setInsertType] = useState<'upload' | 'link'>(onUpload ? 'upload' : 'link')
  const { anchorEl, triggerRef, openFromEvent, close, isOpen } = useInsertPopover<HTMLDivElement>()
  const handleChangeInsertType = (event: React.SyntheticEvent, newValue: string) => setInsertType(newValue as 'upload' | 'link')

  const {
    audioInputRef,
    posterInputRef,
    uploadingAudio,
    uploadingPoster,
    audioUploadProgress,
    openPosterPicker,
    handleAudioUpload,
    handlePosterUpload,
  } = useAudioUploadFields({
    onUpload,
    onError,
    onAudioUploaded: ({ url, fileName }) => {
      close()
      setEditSrc(url)
      updateAttributes(createAudioAttributes(attrs, {
        src: url,
        title: attrs.title || fileName,
        poster: attrs.poster || undefined,
      }))
    },
    onPosterUploaded: setEditPoster,
  })

  const handleInsertWithPoster = async () => {
    if (!editSrc.trim()) return
    try {
      let validatedSrc = editSrc.trim()
      if (onValidateUrl) {
        validatedSrc = await Promise.resolve(onValidateUrl(validatedSrc, 'audio'))
      }
      updateAttributes(createAudioAttributes(attrs, {
        src: validatedSrc,
        title: editTitle.trim() || undefined,
        poster: editPoster.trim() || undefined,
      }))
      close()
    } catch (error) {
      onError?.(error as Error)
    }
  }

  return <NodeViewWrapper
    className={`audio-wrapper`}
    data-drag-handle
  >
    <InsertTriggerCard
      ref={triggerRef}
      icon={<Attachment2Icon sx={{ fontSize: '1rem', flexShrink: 0 }} />}
      text={uploadingAudio ? '音频上传中...' : '点击此处嵌入或粘贴音频链接'}
      onClick={openFromEvent}
      uploading={uploadingAudio}
      uploadProgress={audioUploadProgress}
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
          onClick={() => audioInputRef.current?.click()}
          disabled={!onUpload || uploadingAudio}
          fullWidth
          startIcon={uploadingAudio ? <CircularProgress size={20} /> : <UploadCloud2LineIcon sx={{ fontSize: 18 }} />}
        >
          <input
            ref={audioInputRef}
            type="file"
            hidden
            multiple={false}
            accept="audio/*"
            onChange={handleAudioUpload}
          />
          {uploadingAudio ? '音频文件上传中...' : '音频文件'}
        </Button>
      </Stack> : <Stack gap={2} sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          value={editSrc}
          onChange={(e) => setEditSrc(e.target.value)}
          placeholder="输入音频文件的 URL"
        />
        <TextField
          fullWidth
          size="small"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="输入音频名称（可选）"
        />
        <Stack direction={'row'} gap={2}>
          <TextField
            fullWidth
            size="small"
            value={editPoster}
            onChange={(e) => setEditPoster(e.target.value)}
            placeholder="输入海报图片的 URL（可选）"
          />
          <IconButton onClick={openPosterPicker}>
            {uploadingPoster ? <CircularProgress size={20} /> : <UploadCloud2LineIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Stack>
        <input
          ref={posterInputRef}
          type="file"
          hidden
          multiple={false}
          accept="image/*"
          onChange={handlePosterUpload}
        />
        <Button variant="contained" disabled={uploadingPoster} fullWidth onClick={handleInsertWithPoster}>
          嵌入音频
        </Button>
      </Stack>}
    </InsertPopover>
  </NodeViewWrapper>
}

export default InsertAudio
