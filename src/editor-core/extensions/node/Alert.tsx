import { createBlockMarkdownSpec, mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { v4 as uuid } from 'uuid'
import AlertView from '../component/Alert'

export type AlertVariant = 'info' | 'warning' | 'error' | 'success' | 'default'
export type AlertType = 'text' | 'icon'

export interface AlertOptions {
  /**
   * HTML attributes to add to the alert element
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    alert: {
      /** 插入一个 Alert 节点 */
      setAlert: (attributes?: { variant?: AlertVariant, type?: AlertType }) => ReturnType
      /** 切换 Alert 的 variant */
      setAlertVariant: (variant: AlertVariant) => ReturnType
      /** 切换 Alert 的展示类型（是否显示图标） */
      setAlertType: (type: AlertType) => ReturnType
      /** 在当前块与 Alert 之间切换（将当前块转换为 Alert，若已是 Alert 则还原为段落） */
      toggleAlert: (attributes?: { variant?: AlertVariant, type?: AlertType }) => ReturnType
    }
  }
}

export const AlertExtension = Node.create<AlertOptions>({
  name: 'alert',
  group: 'block',
  content: 'block+',
  defining: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        renderHTML: attributes => attributes.id ? { 'data-id': attributes.id } : {},
        parseHTML: element => (element as HTMLElement).getAttribute('data-id'),
      },
      variant: {
        default: 'default',
        renderHTML: attributes => ({ 'data-variant': attributes.variant }),
        parseHTML: element => (element as HTMLElement).getAttribute('data-variant') || 'default',
      },
      type: {
        default: 'icon',
        renderHTML: attributes => ({ 'data-type': attributes.type }),
        parseHTML: element => (element as HTMLElement).getAttribute('data-type') || 'icon',
      },
    }
  },

  parseHTML() {
    return [{
      tag: 'div[data-node="alert"]',
    }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-node': 'alert' }), 0]
  },

  ...createBlockMarkdownSpec({
    nodeName: 'alert',
  }),

  addCommands() {
    return {
      setAlert:
        (attrs = {}) => ({ commands }) => {
          const id = `alert_${uuid()}`
          const variant: AlertVariant = (attrs.variant as AlertVariant) || 'default'
          const type: AlertType = (attrs.type as AlertType) || 'icon'
          return commands.wrapIn(this.name, { id, variant, type })
        },

      setAlertVariant:
        (variant: AlertVariant) => ({ commands }) => {
          return commands.updateAttributes(this.name, { variant })
        },

      setAlertType:
        (type: AlertType) => ({ commands }) => {
          return commands.updateAttributes(this.name, { type })
        },

      toggleAlert:
        (attrs = {}) => ({ commands }) => {
          const variant: AlertVariant = (attrs.variant as AlertVariant) || 'default'
          const type: AlertType = (attrs.type as AlertType) || 'icon'
          return commands.toggleWrap(this.name, { variant, type })
        },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(AlertView)
  },
})

export default AlertExtension


