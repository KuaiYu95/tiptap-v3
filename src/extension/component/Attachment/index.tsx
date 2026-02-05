import { ActionDropdown, FloatingPopover, HoverPopover } from "@ctzhian/tiptap/component";
import { CarouselViewIcon, DeleteLineIcon, DownloadLineIcon, EditLineIcon, ScrollToBottomLineIcon } from "@ctzhian/tiptap/component/Icons";
import { ToolbarItem } from "@ctzhian/tiptap/component/Toolbar";
import { EditorFnProps } from "@ctzhian/tiptap/type";
import { Box, Button, Divider, Stack, TextField } from "@mui/material";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AttachmentContent } from "./AttachmentContent";
import InsertAttachment from "./Insert";

export interface AttachmentAttributes {
  url: string
  title: string
  type: string
  size: string
  view?: string
  height?: number
}

/**
 * 判断附件是否为 PDF 格式
 */
const isPdfFile = (attrs: AttachmentAttributes): boolean => {
  const title = attrs.title?.toLowerCase() || ''
  const type = attrs.type?.toLowerCase() || ''
  const url = attrs.url?.toLowerCase() || ''

  return (
    title.endsWith('.pdf') ||
    type.includes('pdf') ||
    type === 'application/pdf' ||
    url.includes('.pdf')
  )
}

const AttachmentViewWrapper: React.FC<NodeViewProps & EditorFnProps & { attachmentType?: 'icon' | 'block' }> = ({
  editor,
  node,
  updateAttributes,
  deleteNode,
  selected,
  onUpload,
  onError,
  attachmentType = 'icon',
  getPos,
}) => {
  const attrs = node.attrs as AttachmentAttributes
  const attachmentDisplayType = attachmentType || attrs.type || 'icon'

  const [title, setTitle] = useState('')
  const [extension, setExtension] = useState('')
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)
  const attachmentContentRef = useRef<HTMLDivElement>(null)

  const isPdf = isPdfFile(attrs)

  useEffect(() => {
    let title = attrs.title || ''
    setTitle(title.split('.').slice(0, -1).join('.'))
    setExtension(title.split('.').pop() || '')
  }, [attrs.title, attachmentDisplayType])

  const handleShowPopover = () => {
    setAnchorEl(attachmentContentRef.current)
  }
  const handleClosePopover = () => setAnchorEl(null)

  const handleConvertAttachmentType = (newType: 'icon' | 'block' | 'view') => {
    const pos = getPos()
    if (typeof pos !== 'number') return

    const isBlockType = attachmentDisplayType === 'block'
    const isInlineType = attachmentDisplayType === 'icon'
    const isNewBlockType = newType === 'block' || newType === 'view'
    const isNewInlineType = newType === 'icon'

    if (isBlockType && isNewInlineType) {
      editor.chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .insertContentAt(pos, {
          type: 'inlineAttachment',
          attrs: {
            url: attrs.url,
            title: attrs.title,
            type: 'icon',
            size: attrs.size,
          }
        })
        .run()
    } else if (isInlineType && isNewBlockType) {
      editor.chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .insertContentAt(pos, {
          type: 'blockAttachment',
          attrs: {
            url: attrs.url,
            title: attrs.title,
            type: 'block',
            size: attrs.size,
            view: newType === 'view' ? '1' : '0',
          }
        })
        .run()
    } else if (isBlockType && newType === 'view') {
      updateAttributes?.({
        view: '1',
      })
    } else if (isBlockType && newType === 'block' && attrs.view === '1') {
      updateAttributes?.({
        view: '0',
      })
    }
  }

  const renderOperationActions = () => {
    const typeOptions = [
      {
        key: 'icon',
        label: '图标文字',
        icon: <ScrollToBottomLineIcon sx={{ transform: 'rotate(90deg)', fontSize: '1rem' }} />,
        onClick: () => handleConvertAttachmentType('icon'),
      },
      {
        key: 'block',
        label: '文字卡片',
        icon: <CarouselViewIcon sx={{ transform: 'rotate(90deg)', fontSize: '1rem' }} />,
        onClick: () => handleConvertAttachmentType('block'),
      },
    ]

    // 只有 PDF 文件才显示预览卡片选项
    if (isPdf) {
      typeOptions.push({
        key: 'view',
        label: '预览卡片',
        icon: <CarouselViewIcon sx={{ fontSize: '1rem' }} />,
        onClick: () => handleConvertAttachmentType('view'),
      })
    }

    return (
      <Stack
        direction={'row'}
        alignItems={'center'}
        sx={{ p: 0.5 }}
      >
        <ToolbarItem
          icon={<EditLineIcon sx={{ fontSize: '1rem' }} />}
          tip='编辑'
          onClick={handleShowPopover}
        />
        <ToolbarItem
          icon={<DownloadLineIcon sx={{ fontSize: '1rem' }} />}
          tip={'下载'}
          onClick={handleDownload}
        />
        <Divider orientation='vertical' flexItem sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }} />
        <ActionDropdown
          id='attachment-type-dropdown'
          selected={attrs.view === '1' ? 'view' : attachmentDisplayType}
          list={typeOptions}
        />
        <Divider orientation='vertical' flexItem sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }} />
        <ToolbarItem
          icon={<DeleteLineIcon sx={{ fontSize: '1rem' }} />}
          tip='删除'
          onClick={handleDeleteAttachment}
        />
      </Stack>
    )
  }

  const handleSave = () => {
    updateAttributes?.({
      title: title + (extension ? `.${extension}` : ''),
    })
    handleClosePopover()
  }

  const handleDeleteAttachment = () => {
    deleteNode?.()
  }

  const handleDownload = useCallback(() => {
    const a = document.createElement('a')
    a.href = attrs.url
    a.target = '_blank'
    a.download = attrs.title
    a.click()
    a.remove()
  }, [attrs.url, attrs.title])

  if ((!attrs.url || attrs.url === 'error') && !editor.isEditable) {
    return null
  }

  if (!editor.isEditable) {
    return <NodeViewWrapper
      className={`attachment-wrapper ${attachmentDisplayType === 'block' ? 'block-attachment-wrapper' : ''}`}
      as={attachmentDisplayType === 'block' ? 'div' : 'span'}
    >
      <AttachmentContent
        isPdf={isPdf}
        attrs={attrs}
        type={attachmentDisplayType === 'block' ? 'block' : 'icon'}
        editable={false}
      />
    </NodeViewWrapper>
  }

  if (!attrs.title) {
    return <InsertAttachment
      editor={editor}
      selected={selected}
      attrs={attrs}
      updateAttributes={updateAttributes}
      deleteNode={deleteNode}
      onUpload={onUpload}
      onError={onError}
    />
  }

  return (
    <NodeViewWrapper
      className={`attachment-wrapper ${attachmentDisplayType === 'block' ? 'block-attachment-wrapper' : ''}${selected ? ' ProseMirror-selectednode' : ''}`}
      as={attachmentDisplayType === 'block' ? 'div' : 'span'}
      {...(attachmentDisplayType === 'block' ? { 'data-drag-handle': true } : {})}
    >
      <div ref={attachmentContentRef}>
        <HoverPopover
          actions={renderOperationActions()}
          hoverDelay={500}
          placement="top"
        >
          <AttachmentContent 
            isPdf={isPdf} 
            attrs={attrs} 
            type={attachmentDisplayType === 'block' ? 'block' : 'icon'} 
            editable={true}
            updateAttributes={updateAttributes}
          />
        </HoverPopover>
      </div>
      <FloatingPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        placement="bottom"
      >
        <Stack gap={2} sx={{
          p: 2,
          width: 320,
          '.MuiFormControlLabel-label': {
            fontSize: '0.875rem'
          },
        }}>
          <Stack direction={'row'} gap={2} alignItems={'center'}>
            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', flexShrink: 0 }}>标题</Box>
            <TextField
              fullWidth
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="附件标题"
            />
          </Stack>
          <Stack direction="row" gap={1}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={handleClosePopover}
            >
              取消
            </Button>
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={handleSave}
            >
              修改附件
            </Button>
          </Stack>
        </Stack>
      </FloatingPopover>
    </NodeViewWrapper>
  )
}

export default AttachmentViewWrapper
