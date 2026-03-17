import { HoverPopover } from "../../../../components"
import { DeleteLineIcon, DownloadLineIcon, EditLineIcon, UploadCloud2LineIcon } from "../../../../components/Icons"
import { ToolbarItem } from "../../../../components/Toolbar"
import { EditorFnProps, UploadFunction } from "../../../../types"
import { Divider, Stack } from "@mui/material"
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import React, { useState } from "react"
import { EditPopoverActions, EditPopoverShell, useAnchoredPopover } from "../shared/edit-popover"
import { ResourceTextField, ResourceUploadAction } from "../shared/resource-form"
import AudioPlayer from "./AudioPlayer"
import InsertAudio from "./Insert"
import { AudioAttributes, createAudioAttributes, getAudioDownloadName } from "./shared"
import { useAudioUploadFields } from "./use-audio-upload-fields"

const EditAudioDialog: React.FC<{
  attrs: AudioAttributes
  onSave: (value: { src: string, title?: string, poster?: string }) => void
  onClose?: () => void
  onUpload?: UploadFunction
  onError?: (error: Error) => void
  onValidateUrl?: (url: string, type: 'image' | 'video' | 'audio' | 'iframe') => Promise<string> | string
}> = ({ attrs, onSave, onClose, onUpload, onError, onValidateUrl }) => {
  const [src, setSrc] = useState(attrs.src)
  const [title, setTitle] = useState(attrs.title || '')
  const [poster, setPoster] = useState(attrs.poster || '')

  const handleSave = async () => {
    try {
      let validatedSrc = src
      if (onValidateUrl && src.trim()) {
        validatedSrc = await Promise.resolve(onValidateUrl(src.trim(), 'audio'))
      }
      onSave({ src: validatedSrc, title, poster })
    } catch (error) {
      onError?.(error as Error)
    }
  }

  const {
    audioInputRef,
    posterInputRef,
    uploadingAudio,
    uploadingPoster,
    openAudioPicker,
    openPosterPicker,
    handleAudioUpload,
    handlePosterUpload,
  } = useAudioUploadFields({
    onUpload,
    onError,
    onAudioUploaded: ({ url, fileName }) => {
      setSrc(url)
      setTitle(fileName)
    },
    onPosterUploaded: setPoster,
  })

  return (
    <Stack
      gap={2}
      sx={{
        width: 350,
        bgcolor: 'background.paper',
        borderRadius: 'var(--mui-shape-borderRadius)',
        px: 2,
        py: 1.5,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <ResourceTextField
        label="地址"
        textFieldProps={{
          value: src,
          onChange: (e) => setSrc(e.target.value),
          placeholder: "输入音频文件的 URL",
        }}
        endAction={(
          <ResourceUploadAction
            loading={uploadingAudio}
            icon={<UploadCloud2LineIcon sx={{ fontSize: 18 }} />}
            onClick={openAudioPicker}
          />
        )}
      />
      <ResourceTextField
        label="标题"
        textFieldProps={{
          value: title,
          onChange: (e) => setTitle(e.target.value),
          placeholder: "输入音频名称（可选）",
        }}
      />
      <ResourceTextField
        label="海报"
        textFieldProps={{
          value: poster,
          onChange: (e) => setPoster(e.target.value),
          placeholder: "输入海报图片的 URL（可选）",
        }}
        endAction={(
          <ResourceUploadAction
            loading={uploadingPoster}
            icon={<UploadCloud2LineIcon sx={{ fontSize: 18 }} />}
            onClick={openPosterPicker}
          />
        )}
      />
      <input
        ref={audioInputRef}
        type="file"
        hidden
        multiple={false}
        accept="audio/*"
        onChange={handleAudioUpload}
      />
      <input
        ref={posterInputRef}
        type="file"
        hidden
        multiple={false}
        accept="image/*"
        onChange={handlePosterUpload}
      />
      <EditPopoverActions
        onCancel={() => onClose?.()}
        onConfirm={handleSave}
        confirmDisabled={uploadingPoster || uploadingAudio || !src.trim()}
      />
    </Stack>
  )
}

const AudioViewWrapper: React.FC<NodeViewProps & EditorFnProps> = ({
  editor,
  node,
  updateAttributes,
  deleteNode,
  selected,
  onUpload,
  onError,
  onValidateUrl
}) => {
  const attrs = node.attrs as AudioAttributes

  const [keepHoverPopoverOpen, setKeepHoverPopoverOpen] = useState(false)
  const { anchorEl, anchorRef, isOpen, openFromRef, close } = useAnchoredPopover<HTMLButtonElement>()

  const handleShowPopover = () => {
    setKeepHoverPopoverOpen(true)
    openFromRef()
  }

  const handleClosePopover = () => {
    close()
    setKeepHoverPopoverOpen(false)
  }

  // 处理下载
  const handleDownload = () => {
    if (attrs.src) {
      const link = document.createElement('a')
      link.href = attrs.src
      link.download = getAudioDownloadName(attrs)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // 更新音频源和海报
  const updateAudioSource = (value: { src: string, title?: string, poster?: string }) => {
    updateAttributes(createAudioAttributes(attrs, {
      src: value.src,
      title: value.title || null,
      poster: value.poster || null,
    }))
    handleClosePopover()
  }

  if (!attrs.src && !editor.isEditable) {
    return null
  }

  if (!attrs.src) {
    return <InsertAudio selected={selected} attrs={attrs} updateAttributes={updateAttributes} onUpload={onUpload} onError={onError} onValidateUrl={onValidateUrl} />
  }

  const isEditable = editor.isEditable

  return (
    <NodeViewWrapper
      className={`audio-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
      data-drag-handle
    >
      {isEditable ? (
        <HoverPopover
          keepOpen={keepHoverPopoverOpen}
          placement="top"
          offset={4}
          actions={
            <Stack
              direction={'row'}
              alignItems={'center'}
              sx={{ p: 0.5 }}
            >
              <ToolbarItem
                ref={anchorRef}
                icon={<EditLineIcon sx={{ fontSize: '1rem' }} />}
                tip="编辑音频"
                onClick={handleShowPopover}
              />
              <ToolbarItem
                icon={<DownloadLineIcon sx={{ fontSize: '1rem' }} />}
                tip="下载音频"
                onClick={handleDownload}
              />
              <Divider
                orientation="vertical"
                flexItem
                sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }}
              />
              <ToolbarItem
                icon={<DeleteLineIcon sx={{ fontSize: '1rem' }} />}
                tip="删除音频"
                onClick={deleteNode}
              />
            </Stack>
          }
        >
          <AudioPlayer attrs={attrs} onError={onError} />
        </HoverPopover>
      ) : (
        <AudioPlayer attrs={attrs} onError={onError} />
      )}
      {isEditable && (
        <EditPopoverShell
          open={isOpen}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
        >
          <EditAudioDialog
            attrs={attrs}
            onSave={updateAudioSource}
            onClose={handleClosePopover}
            onUpload={onUpload}
            onError={onError}
            onValidateUrl={onValidateUrl}
          />
        </EditPopoverShell>
      )}
    </NodeViewWrapper>
  )
}

export default AudioViewWrapper
