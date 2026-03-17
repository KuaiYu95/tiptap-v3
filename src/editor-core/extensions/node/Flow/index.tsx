import { EditorFnProps } from '../../../../types'
import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { MermaidConfig } from 'mermaid'
import FlowViewWrapper from '../../component/Flow'
import { initMermaid } from '../../component/Flow/utils'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    flow: {
      setFlow: (options: {
        code?: string
        width?: string | number
        align?: 'left' | 'center' | 'right' | null
      }) => ReturnType
    }
  }
}

export type FlowExtensionProps = EditorFnProps & {
  /**
   * Mermaid 配置选项
   */
  mermaidOptions?: MermaidConfig
}

export const FlowExtension = (props: FlowExtensionProps) => {
  // 初始化 mermaid 配置（如果提供了配置）
  if (props.mermaidOptions) {
    initMermaid(props.mermaidOptions)
  }

  return Node.create({
    name: 'flow',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: true,

    addAttributes() {
      return {
        class: {
          default: 'flow-wrapper',
        },
        code: {
          default: '',
          parseHTML: element => element.getAttribute('data-code') || '',
          renderHTML: attributes => {
            if (!attributes.code) return {}
            return { 'data-code': attributes.code }
          },
        },
        width: {
          default: null,
          parseHTML: element => {
            const width = element.getAttribute('data-width')
            if (width) {
              if (width.endsWith('%')) return width
              const numWidth = parseFloat(width)
              return isNaN(numWidth) ? null : numWidth
            }
            return null
          },
          renderHTML: attributes => {
            if (!attributes.width) return {}
            return { 'data-width': String(attributes.width) }
          },
        },
        align: {
          default: null,
          parseHTML: element => element.getAttribute('data-align') || null,
          renderHTML: attributes => {
            if (!attributes.align) return {}
            return { 'data-align': attributes.align }
          },
        },
      }
    },

    parseHTML() {
      return [
        {
          tag: 'div[data-type="flow"]',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLElement)) return false
            const code = dom.getAttribute('data-code') || ''
            const widthAttr = dom.getAttribute('data-width')
            let width: string | number | null = null
            if (widthAttr) {
              if (widthAttr.endsWith('%')) {
                width = widthAttr
              } else {
                const numWidth = parseFloat(widthAttr)
                width = isNaN(numWidth) ? null : numWidth
              }
            }
            const align = dom.getAttribute('data-align') as 'left' | 'center' | 'right' | null || null
            return { code, width, align }
          },
        }
      ]
    },

    renderHTML({ HTMLAttributes, node }) {
      const attrs = node.attrs as { code?: string; width?: string | number; align?: 'left' | 'center' | 'right' | null }
      return ['div', mergeAttributes(
        { 'data-type': 'flow' },
        attrs.code ? { 'data-code': attrs.code } : {},
        attrs.width ? { 'data-width': String(attrs.width) } : {},
        attrs.align ? { 'data-align': attrs.align } : {},
        this.options.HTMLAttributes,
        HTMLAttributes
      )]
    },

    renderMarkdown(node) {
      const { code } = node.attrs as { code?: string; }
      if (!code) return ''
      return `\`\`\`mermaid\n${code}\n\`\`\``
    },

    addCommands() {
      return {
        setFlow: (options) => ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              code: options.code || '',
              width: options.width || null,
              align: options.align || null,
            },
          })
        },
      }
    },

    addNodeView() {
      return ReactNodeViewRenderer((renderProps) => FlowViewWrapper({ ...renderProps, onError: props.onError }))
    },
  })
}

export default FlowExtension
