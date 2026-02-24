import { EditorContent } from "@tiptap/react"
import React, { useEffect } from "react"
import { ImageViewerProvider } from "../component/ImageViewer"
import useTiptap from "../hook"

// fix: https://github.com/ueberdosis/tiptap/issues/6785
import 'core-js/actual/array/find-last'

interface EditorDiffProps {
  oldHtml: string
  newHtml: string
  baseUrl?: string
}

const EditorDiff = ({
  oldHtml,
  newHtml,
  baseUrl
}: EditorDiffProps) => {
  const editorRef = useTiptap({
    editable: false,
    content: newHtml,
    baseUrl,
    exclude: ['youtube', 'mention',]
  })

  useEffect(() => {
    const editor = editorRef.editor
    if (!editor) return
    // 确保内容与 newHtml 同步（useEditor 的 content 仅在初始化时生效，props 变化需手动 setContent）
    editor.commands.setContent(newHtml, { emitUpdate: false })
    editor.commands.showStructuredDiff(oldHtml, newHtml)
    return () => {
      editor.commands.hideStructuredDiff?.()
    }
  }, [oldHtml, newHtml, editorRef.editor])

  return <ImageViewerProvider
    speed={500}
    maskOpacity={0.3}
  >
    <EditorContent editor={editorRef.editor} />
  </ImageViewerProvider>
}

export default EditorDiff
