import { slashCommands } from '../../../constants/slash-commands'
import type { Editor, SlashCommandsListProps, SlashCommandsListRef } from '../../../types'
import { ReactRenderer } from '@tiptap/react'
import { SuggestionProps } from '@tiptap/suggestion'
import SlashCommandsOverlay from '../component/SlashCommandsList/Overlay'

export const slashSuggestion = () => {
  return {
    items: ({ query }: { query: string }) => {
      return slashCommands
      // const commands = slashCommands
      // if (!query) return commands
      // return commands.filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
    },
    decorationTag: 'span',
    decorationClass: 'slash-decoration',
    decorationContent: '插入',
    command: ({ editor, range, props }: { editor: Editor; range: { from: number; to: number }; props: any }) => {
      props.command({ editor, range, attrs: props.attrs })
    },
    render: () => {
      let component: ReactRenderer<SlashCommandsListRef, SlashCommandsListProps> | null = null
      let lastProps: SuggestionProps<any> | null = null

      const isCaretAfterSlash = (editor: Editor) => {
        try {
          const pos = editor.state.selection.from
          if (pos <= 1) return false
          const char = editor.state.doc.textBetween(pos - 1, pos, '\n', '\n')
          return char === '/'
        } catch {
          return false
        }
      }

      return {
        onStart: (props: SuggestionProps<any>) => {
          lastProps = props
          const shouldOpen = !props.query || props.query.length === 0
          component = new ReactRenderer(SlashCommandsOverlay, {
            props: { ...props, open: shouldOpen },
            editor: props.editor,
          })
          if (!props.clientRect) return
          const element = component.element as HTMLElement
          document.body.appendChild(element)
        },
        onUpdate(props: SuggestionProps<any>) {
          if (!component) return false
          lastProps = props
          const shouldOpen = !props.query || props.query.length === 0
          component.updateProps({ ...props, open: shouldOpen })
        },
        onKeyDown(props: { event: KeyboardEvent }) {
          if (!component) return false
          if (props.event.key === 'Escape') {
            component.element.remove()
            component.destroy()
            return true
          }
          return component.ref?.onKeyDown(props) || false
        },
        onExit() {
          if (!component) return false
          const editor = lastProps?.editor as Editor | undefined
          if (editor && isCaretAfterSlash(editor)) {
            return false
          }
          component.updateProps({ open: false } as any)
          component.destroy()
          component.element.remove()
        },
      }
    },
  }
}

export default slashSuggestion
