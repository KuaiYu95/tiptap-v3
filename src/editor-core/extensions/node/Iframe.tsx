import { EditorFnProps } from '../../../types'
import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import IframeViewWrapper from '../../../features/media/iframe'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (options: {
        type?: 'iframe' | 'bilibili'
        src: string
        width?: number | string
        height?: number
        align?: 'left' | 'center' | 'right'
      }) => ReturnType
    }
  }
}

export type IframeExtensionProps = EditorFnProps

export const IframeExtension = (props: IframeExtensionProps) => Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      class: {
        default: 'iframe-wrapper',
      },
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => {
          if (!attributes.src) return {}
          return { src: attributes.src }
        },
      },
      width: {
        default: '100%',
        parseHTML: element => {
          const width = element.getAttribute('width')
          if (width) {
            if (width.endsWith('%')) return width
            const numWidth = parseInt(width, 10)
            return isNaN(numWidth) ? '100%' : numWidth
          }
          return '100%'
        },
        renderHTML: attributes => {
          return { width: attributes.width }
        },
      },
      height: {
        default: 400,
        parseHTML: element => {
          const height = element.getAttribute('height')
          return height ? parseInt(height, 10) : 400
        },
        renderHTML: attributes => {
          return { height: attributes.height }
        },
      },
      type: {
        default: 'iframe',
        parseHTML: element => {
          return element.getAttribute('data-type')
        },
        renderHTML: attributes => {
          return { 'data-type': attributes.type }
        },
      },
      align: {
        default: null,
        parseHTML: element => {
          return element.getAttribute('data-align')
        },
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
        tag: 'iframe',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false

          const src = dom.getAttribute('src')
          if (!src) return false

          const widthAttr = dom.getAttribute('width')
          let width: number | string = '100%'
          if (widthAttr) {
            // 如果是百分比，保留字符串格式
            if (widthAttr.endsWith('%')) {
              width = widthAttr
            } else {
              // 否则解析为数字
              const numWidth = parseInt(widthAttr, 10)
              width = isNaN(numWidth) ? '100%' : numWidth
            }
          }

          const height = dom.getAttribute('height') ? parseInt(dom.getAttribute('height')!, 10)
            : dom.style.height ? parseInt(dom.style.height, 10) : 400

          return {
            src,
            width,
            height,
            align: dom.getAttribute('data-align') || dom.getAttribute('align'),
          }
        },
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { src, ...rest } = HTMLAttributes as any
    return ['iframe', mergeAttributes(this.options.HTMLAttributes, { ...rest, src, frameborder: '0', allowfullscreen: 'true', autoplay: '0', loop: '0' })]
  },

  renderMarkdown(node) {
    const { src, width, height, 'data-align': align } = node.attrs as any
    if (!src || src.trim() === '') return ''
    return `<iframe src="${src}" ${width ? `width="${width}"` : ''} ${height ? `height="${height}"` : ''} ${align ? `data-align="${align}"` : ''} frameborder="0" allowfullscreen="true" autoplay="0" loop="0"></iframe>`
  },

  addCommands() {
    return {
      setIframe: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            type: options.type || 'iframe',
            src: options.src,
            width: options.width || '100%',
            height: options.height || 400,
            align: options.align || null,
          },
        })
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer((renderProps) => IframeViewWrapper({ ...renderProps, onError: props.onError, onValidateUrl: props.onValidateUrl }))
  },
})

export default IframeExtension
