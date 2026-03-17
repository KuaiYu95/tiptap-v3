import { MentionExtensionProps } from '../../../types'
import { updatePosition } from '../../../utils'
import { MentionOptions } from '@tiptap/extension-mention'
import { Editor, ReactRenderer } from '@tiptap/react'
import { SuggestionProps } from '@tiptap/suggestion'
import { MentionList, MentionListProps, MentionListRef } from '../component/MentionList'

export const mentionSuggestion = ({ mentionItems, onMentionFilter }: MentionExtensionProps): MentionOptions["suggestion"] => {
  let getItems: ((props: {
    query: string;
    editor: Editor;
  }) => any[] | Promise<any[]>) | undefined

  if (mentionItems && mentionItems.length > 0) {
    getItems = ({ query }: { query: string }) => {
      return mentionItems.filter(item => item.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 5)
    }
  } else if (onMentionFilter) {
    getItems = async ({ query }: { query: string }) => {
      const items = await onMentionFilter?.({ query })
      return items.filter(item => item.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 5)
    }
  }

  return {
    items: getItems,
    render: () => {
      let component: ReactRenderer<MentionListRef, MentionListProps> | null = null

      return {
        onStart: (props: SuggestionProps<any>) => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          })
          if (!props.clientRect) return
          const element = component.element as HTMLElement
          element.style.position = 'absolute'
          document.body.appendChild(element)
          updatePosition(props.editor, element)
        },
        onUpdate(props: SuggestionProps<any>) {
          if (!component) return
          component.updateProps(props)
          if (!props.clientRect) return
          updatePosition(props.editor, component.element as HTMLElement)
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
          if (!component) return
          component.destroy()
          component.element.remove()
        },
      }
    },
  }
}

export default mentionSuggestion
