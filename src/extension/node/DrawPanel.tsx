import { EditorFnProps } from '@ctzhian/tiptap/type'
import { createBlockMarkdownSpec, mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ExcalidrawView from '../component/DrawPanel'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    excalidraw: {
      setExcalidraw: () => ReturnType
    }
  }
}

export const ExcalidrawExtension = (props: EditorFnProps = {}) => Node.create({
  name: 'excalidraw',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {}
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="excalidraw"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'figure',
      mergeAttributes({ 'data-type': 'excalidraw' }, HTMLAttributes, this.options.HTMLAttributes),
      0,
    ]
  },

  ...createBlockMarkdownSpec({
    nodeName: 'excalidraw',
  }),

  addCommands() {
    return {
      setExcalidraw:
        () => ({ commands }) =>
          commands.insertContent({
            type: this.name,
          }),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer((renderProps) => ExcalidrawView({ ...renderProps, ...props }))
  },
})

export default ExcalidrawExtension
