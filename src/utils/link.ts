import { Editor } from '@tiptap/react'

export const getLinkTitle = (href: string) => {
  const paths = href.split('/').filter(it => it.trim().length > 0)
  return paths[paths.length - 1]
}

export const getLinkAttributesWithSelectedText = (editor: Editor): { title?: string } => {
  if (!editor) {
    return {}
  }

  const { selection } = editor.state
  const { from, to } = selection

  if (selection.empty || from === to) {
    return {}
  }

  const selectedText = editor.state.doc.textBetween(from, to, '')
  const trimmedText = selectedText.trim()

  if (trimmedText.length > 0) {
    return { title: trimmedText }
  }

  return {}
}
