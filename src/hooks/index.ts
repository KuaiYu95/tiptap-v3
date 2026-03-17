import { getExtensions } from '../editor-core/extensions'
import { UploadFunction, UseTiptapProps, UseTiptapReturn } from '../types'
import { withBaseUrl } from '../utils'
import { migrateMathStrings } from '@tiptap/extension-mathematics'
import { useEditor, UseEditorOptions } from '@tiptap/react'
import React from 'react'

const useTiptap = ({
  editable = true,
  contentType = 'html',
  onSave,
  onError,
  onUpload,
  onUploadImgUrl,
  baseUrl = '',
  ...options
}: UseTiptapProps & UseEditorOptions): UseTiptapReturn => {
  const userEditorProps = options.editorProps
  const userHandleKeyDown = userEditorProps?.handleKeyDown
  const userOnCreate = options.onCreate

  const handleUpload: UploadFunction | undefined = onUpload
    ? (file, onProgress, abortSignal) =>
      onUpload(file, onProgress, abortSignal).then((url) => withBaseUrl(url, baseUrl))
    : undefined

  const handleUploadImgUrl = onUploadImgUrl
    ? (url: string, abortSignal?: AbortSignal) =>
      onUploadImgUrl(url, abortSignal).then((newUrl) => withBaseUrl(newUrl, baseUrl))
    : undefined

  const extensions = React.useMemo(() => getExtensions({
    editable,
    onError,
    baseUrl,
    onUpload: handleUpload,
    onUploadImgUrl: handleUploadImgUrl,
    ...options
  }), [
    editable,
    onError,
    baseUrl,
    handleUpload,
    handleUploadImgUrl,
    options,
  ])

  const editor = useEditor({
    editable,
    extensions,
    ...(contentType === 'markdown' ? {
      contentType: 'markdown',
    } : {}),
    ...options,
    editorProps: {
      ...userEditorProps,
      handleKeyDown: (view, event) => {
        const handledByUser = userHandleKeyDown?.(view, event)
        if (handledByUser) {
          return handledByUser
        }
        if (editable && event.key === 's' && (event.metaKey || event.ctrlKey) && onSave) {
          event.preventDefault()
          onSave?.(editor)
          return true
        }
        if (event.key === 'Tab') {
          const aiWritingEnabled = !!(editor as any)?.storage?.aiWriting?.enabled
          if (aiWritingEnabled) {
            return false
          }
          const isInList = editor?.isActive('orderedList') ||
            editor?.isActive('bulletList') ||
            editor?.isActive('taskList')
          const isInTable = editor?.isActive('table')
          if (!isInList && !isInTable) {
            event.preventDefault()
            const tr = view.state.tr.insertText('\t')
            view.dispatch(tr)
            return true
          }
        }
        return false
      }
    },
    onCreate: ({ editor: currentEditor }) => {
      userOnCreate?.({ editor: currentEditor })
      setTimeout(() => {
        try {
          migrateMathStrings(currentEditor)
        } catch (error) {
          console.warn('数学公式迁移失败:', error)
          onError?.(error as Error)
        }
      }, 100)
    },
  })

  return {
    editor,
    setContent: (value, type) => {
      if (!editor) return
      editor.chain().focus().setContent(value, {
        contentType: type || (contentType === 'markdown' ? 'markdown' : 'html')
      })?.run()
    },
    getContent: () => {
      if (!editor) return ''
      if (contentType === 'markdown') {
        return editor.getMarkdown()
      }
      return editor.getHTML() || ''
    },
    getMarkdown: () => {
      if (!editor) return ''
      return editor.getMarkdown()
    },
    getText: () => {
      if (!editor) return ''
      return editor.getText() || ''
    },
    getHTML: () => {
      if (!editor) return ''
      return editor.getHTML() || ''
    },
    getJSON: () => {
      if (!editor) return null
      return editor.getJSON() || null
    },
  }
}

export default useTiptap;
