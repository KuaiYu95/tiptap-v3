import { EditorFnProps } from "@ctzhian/tiptap/type";
import { removeBaseUrl, withBaseUrl } from "@ctzhian/tiptap/util";
import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import AttachmentViewWrapper from "../component/Attachment";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineAttachment: {
      /**
       * Insert an inline attachment
       */
      setInlineAttachment: (options: {
        url: string
        title: string
        size: string
      }) => ReturnType
    }
    blockAttachment: {
      /**
       * Insert a block attachment
       */
      setBlockAttachment: (options: {
        url: string
        title: string
        size: string
        view?: '0' | '1'
      }) => ReturnType
    }
  }
}

export type AttachmentExtensionProps = EditorFnProps & { baseUrl: string }

// 内联附件扩展
export const InlineAttachmentExtension = (props: AttachmentExtensionProps) => Node.create({
  name: 'inlineAttachment',
  group: 'inline',
  inline: true,
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      url: {
        default: '',
        parseHTML: element => withBaseUrl(
          element.getAttribute('data-url') || element.getAttribute('href') || '',
          props.baseUrl
        ),
        renderHTML: (attributes) => {
          return {
            'data-url': removeBaseUrl(attributes.url, props.baseUrl),
          }
        },
      },
      title: {
        default: '',
        parseHTML: (element) => {
          return element.getAttribute('data-title')
            || element.getAttribute('title')
            || element.getAttribute('aria-label')
            || element.textContent
        },
        renderHTML: (attributes) => {
          return {
            'data-title': attributes.title,
          }
        },
      },
      size: {
        default: '0',
        parseHTML: (element) => {
          return element.getAttribute('data-size') || '0'
        },
        renderHTML: (attributes) => {
          return {
            'data-size': attributes.size,
          }
        },
      },
      type: {
        default: 'icon',
        parseHTML: (element) => {
          return element.getAttribute('data-type') || 'icon'
        },
        renderHTML: (attributes) => {
          return {
            'data-type': attributes.type || 'icon',
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-tag="attachment"]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false
          return {
            url: dom.getAttribute('data-url') || '',
            title: dom.getAttribute('data-title') || '',
            size: dom.getAttribute('data-size') || '0',
          }
        }
      },
      {
        tag: 'a[download]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false
          const download = dom.getAttribute('download')
          const type = dom.getAttribute('type')

          // 只解析 type 不是 block 的带 download 的 <a> 标签
          if (download === null || type === 'block') {
            return false
          }

          const href = dom.getAttribute('href') || ''
          const title = dom.textContent || dom.getAttribute('title') || dom.getAttribute('download') || ''

          return {
            url: href,
            title: title,
            size: '0',
            type: 'icon',
          }
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { 'data-tag': 'attachment', ...mergeAttributes(this.options.HTMLAttributes, HTMLAttributes) }]
  },

  renderMarkdown(node) {
    const { url, title } = node.attrs as any
    if (!url) return ''
    return `<a href="${url}" target="_blank" download="${title}">${title}</a>`
  },

  addKeyboardShortcuts() {
    return {
      'Mod-5': () => {
        return this.editor.commands.setInlineAttachment({
          url: '',
          title: '',
          size: '0',
        })
      }
    }
  },

  addCommands() {
    return {
      setInlineAttachment: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            url: options.url || '',
            title: options.title || '',
            size: options.size || '0',
            type: 'icon',
          }
        })
      }
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer((renderProps) => AttachmentViewWrapper({ ...renderProps, onUpload: props.onUpload, onError: props.onError, attachmentType: 'icon' }))
  },
});

// 块级附件扩展
export const BlockAttachmentExtension = (props: AttachmentExtensionProps) => Node.create({
  name: 'blockAttachment',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      view: {
        default: '0',
        parseHTML: (element) => {
          return element.getAttribute('data-view') || '0'
        },
        renderHTML: (attributes) => {
          return {
            'data-view': attributes.view,
          }
        },
      },
      url: {
        default: '',
        parseHTML: element => withBaseUrl(
          element.getAttribute('data-url') || element.getAttribute('href') || '',
          props.baseUrl
        ),
        renderHTML: attributes => {
          if (!attributes.url) return {}
          return { 'data-url': removeBaseUrl(attributes.url, props.baseUrl) }
        },
      },
      title: {
        default: '',
        parseHTML: (element) => {
          return element.getAttribute('data-title')
            || element.getAttribute('title')
            || element.getAttribute('aria-label')
            || element.textContent
        },
        renderHTML: (attributes) => {
          return {
            'data-title': attributes.title,
          }
        },
      },
      size: {
        default: '0',
        parseHTML: (element) => {
          return element.getAttribute('data-size') || '0'
        },
        renderHTML: (attributes) => {
          return {
            'data-size': attributes.size,
          }
        },
      },
      type: {
        default: 'block',
        parseHTML: (element) => {
          return element.getAttribute('data-type') || 'block'
        },
        renderHTML: (attributes) => {
          return {
            'data-type': attributes.type || 'block',
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-tag="attachment"]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false
          const viewAttr = dom.getAttribute('data-view')
          return {
            view: viewAttr !== null ? viewAttr : '0',
            url: dom.getAttribute('data-url') || '',
            title: dom.getAttribute('data-title') || '',
            size: dom.getAttribute('data-size') || '0',
            type: dom.getAttribute('data-type') || 'block',
          }
        }
      },
      {
        tag: 'a[download][type="block"]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false
          const download = dom.getAttribute('download')
          const type = dom.getAttribute('type')
          const view = dom.getAttribute('data-view') || '0'

          // 只解析 type="block" 的带 download 的 <a> 标签
          if (download === null || type !== 'block') {
            return false
          }

          const href = dom.getAttribute('href') || ''
          const title = dom.textContent || dom.getAttribute('title') || dom.getAttribute('download') || ''

          return {
            view: view,
            url: href,
            title: title,
            size: '0',
            type: 'block',
          }
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-tag': 'attachment', ...mergeAttributes(this.options.HTMLAttributes, HTMLAttributes) }]
  },

  renderMarkdown(node) {
    const { url, title, view } = node.attrs as any
    if (!url) return ''
    return `<a href="${url}" data-view="${view}" type="block" target="_blank" download="${title}">${title}</a>`
  },

  addCommands() {
    return {
      setBlockAttachment: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            view: options.view || '0',
            url: options.url || '',
            title: options.title || '',
            size: options.size || '0',
            type: 'block',
          }
        })
      }
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer((renderProps) => AttachmentViewWrapper({ ...renderProps, onUpload: props.onUpload, onError: props.onError, attachmentType: 'block' }))
  },
});