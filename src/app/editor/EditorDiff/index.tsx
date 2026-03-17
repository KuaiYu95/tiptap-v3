import { EditorContent } from "@tiptap/react"
import React, { useEffect } from "react"
import { ImageViewerProvider } from "../../../components/ImageViewer"
import useTiptap from "../../../hooks"

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
    if (!editorRef.editor) return
    editorRef.editor.commands.showStructuredDiff(oldHtml, newHtml)
    return () => {
      editorRef.editor?.commands.hideStructuredDiff?.()
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
