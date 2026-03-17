import { Node } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'
import { Editor } from '@tiptap/react'

export const insertNodeAfterPosition = (editor: Editor, pos: number, nodeContent: any) => {
  editor.chain().focus().insertContentAt(pos, nodeContent).run()
}

export const hasMarksInBlock = (node: Node | null | undefined): boolean => {
  if (!node) return false
  if ((node as any).marks && (node as any).marks.length > 0) return true

  const children = (node as any).content?.content as Node[] | undefined
  if (!children || children.length === 0) return false

  return children.some(child => hasMarksInBlock(child))
}

export const hasMarksInSelection = (state: EditorState) => {
  if (state.selection.empty) {
    return false
  }

  const { from, to } = state.selection
  let hasMarks = false

  state.doc.nodesBetween(from, to, node => {
    if (node.marks && node.marks.length > 0) {
      hasMarks = true
      return false
    }
  })

  return hasMarks
}
