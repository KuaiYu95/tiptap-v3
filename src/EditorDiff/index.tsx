import { EditorContent } from "@tiptap/react"
import React, { useEffect } from "react"
import { ImageViewerProvider } from "../component/ImageViewer"
import useTiptap from "../hook"
import type { StructuredDiffOptions } from "../util/structuredDiff"

// fix: https://github.com/ueberdosis/tiptap/issues/6785
import 'core-js/actual/array/find-last'

interface EditorDiffProps {
  oldHtml: string
  newHtml: string
  baseUrl?: string
  diffOptions?: Partial<StructuredDiffOptions>
}

const EditorDiff = ({
  oldHtml,
  newHtml,
  baseUrl,
  diffOptions
}: EditorDiffProps) => {
  const editorRef = useTiptap({
    editable: false,
    content: newHtml,
    baseUrl,
    structuredDiffOptions: diffOptions,
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
