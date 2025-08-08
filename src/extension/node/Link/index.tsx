import { mergeAttributes, Node, nodePasteRule, type PasteRuleMatch } from '@tiptap/core'
import type { Plugin } from '@tiptap/pm/state'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { find, registerCustomProtocol, reset } from 'linkifyjs'
import LinkViewWrapper from '../../component/Link'
import { autolink } from './helpers/autolink'
import { clickHandler } from './helpers/clickHandler'
import { pasteHandler } from './helpers/pasteHandler'
import { UNICODE_WHITESPACE_REGEX_GLOBAL } from './helpers/whitespace'

export interface LinkProtocolOptions {
  /**
   * The protocol scheme to be registered.
   * @default '''
   * @example 'ftp'
   * @example 'git'
   */
  scheme: string

  /**
   * If enabled, it allows optional slashes after the protocol.
   * @default false
   * @example true
   */
  optionalSlashes?: boolean
}

/**
 * @deprecated The default behavior is now to open links when the editor is not editable.
 */
type DeprecatedOpenWhenNotEditable = 'whenNotEditable'

export interface LinkOptions {
  /**
 * If enabled, the extension will automatically add links as you type.
 * @default true
 * @example false
 */
  autolink: boolean

  /**
   * An array of custom protocols to be registered with linkifyjs.
   * @default []
   * @example ['ftp', 'git']
   */
  protocols: Array<LinkProtocolOptions | string>

  /**
   * Default protocol to use when no protocol is specified.
   * @default 'http'
   */
  defaultProtocol: string
  /**
   * If enabled, links will be opened on click.
   * @default true
   * @example false
   */
  openOnClick: boolean | DeprecatedOpenWhenNotEditable
  /**
   * If enabled, the link will be selected when clicked.
   * @default false
   * @example true
   */
  enableClickSelection: boolean
  /**
   * Adds a link to the current selection if the pasted content only contains an url.
   * @default true
   * @example false
   */
  linkOnPaste: boolean

  /**
   * HTML attributes to add to the link element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>

  /**
   * @deprecated Use the `shouldAutoLink` option instead.
   * A validation function that modifies link verification for the auto linker.
   * @param url - The url to be validated.
   * @returns - True if the url is valid, false otherwise.
   */
  validate: (url: string) => boolean

  /**
   * A validation function which is used for configuring link verification for preventing XSS attacks.
   * Only modify this if you know what you're doing.
   *
   * @returns {boolean} `true` if the URL is valid, `false` otherwise.
   *
   * @example
   * isAllowedUri: (url, { defaultValidate, protocols, defaultProtocol }) => {
   * return url.startsWith('./') || defaultValidate(url)
   * }
   */
  isAllowedUri: (
    /**
     * The URL to be validated.
     */
    url: string,
    ctx: {
      /**
       * The default validation function.
       */
      defaultValidate: (url: string) => boolean
      /**
       * An array of allowed protocols for the URL (e.g., "http", "https"). As defined in the `protocols` option.
       */
      protocols: Array<LinkProtocolOptions | string>
      /**
       * A string that represents the default protocol (e.g., 'http'). As defined in the `defaultProtocol` option.
       */
      defaultProtocol: string
    },
  ) => boolean

  /**
   * Determines whether a valid link should be automatically linked in the content.
   *
   * @param {string} url - The URL that has already been validated.
   * @returns {boolean} - True if the link should be auto-linked; false if it should not be auto-linked.
   */
  shouldAutoLink: (url: string) => boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineLink: {
      /**
       * Set a link mark
       * @param attributes The link attributes
       * @example editor.commands.setInlineLink({ href: 'https://tiptap.dev' })
       */
      setInlineLink: (attributes: {
        href: string
        target?: string | null
        rel?: string | null
        class?: string | null
        title?: string | null
        type?: string | null
      }) => ReturnType
      /**
       * Toggle a link mark
       * @param attributes The link attributes
       * @example editor.commands.toggleInlineLink({ href: 'https://tiptap.dev' })
       */
      toggleInlineLink: (attributes?: {
        href: string
        target?: string | null
        rel?: string | null
        class?: string | null
        title?: string | null
        type?: string | null
      }) => ReturnType
      /**
       * Unset a link mark
        * @example editor.commands.unsetInlineLink()
       */
      unsetInlineLink: () => ReturnType
    }
    blockLink: {
      /**
       * Set a block link
       * @param attributes The link attributes
       * @example editor.commands.setBlockLink({ href: 'https://tiptap.dev' })
       */
      setBlockLink: (attributes: {
        href: string
        target?: string | null
        rel?: string | null
        class?: string | null
        title?: string | null
        type?: string | null
      }) => ReturnType
    }
  }
}

export function isAllowedUri(uri: string | undefined, protocols?: LinkOptions['protocols']) {
  const allowedProtocols: string[] = ['http', 'https', 'ftp', 'ftps', 'mailto', 'tel', 'callto', 'sms', 'cid', 'xmpp']

  if (protocols) {
    protocols.forEach(protocol => {
      const nextProtocol = typeof protocol === 'string' ? protocol : protocol.scheme

      if (nextProtocol) {
        allowedProtocols.push(nextProtocol)
      }
    })
  }

  return (
    !uri ||
    uri.replace(UNICODE_WHITESPACE_REGEX_GLOBAL, '').match(
      new RegExp(
        // eslint-disable-next-line no-useless-escape
        `^(?:(?:${allowedProtocols.join('|')}):|[^a-z]|[a-z0-9+.\-]+(?:[^a-z+.\-:]|$))`,
        'i',
      ),
    )
  )
}

export const InlineLinkExtension = Node.create<LinkOptions>({
  name: 'inlineLink',
  group: 'inline',
  inline: true,
  atom: true,
  draggable: true,
  selectable: true,

  onCreate() {
    if (this.options.validate && !this.options.shouldAutoLink) {
      this.options.shouldAutoLink = this.options.validate
      console.warn('The `validate` option is deprecated. Rename to the `shouldAutoLink` option instead.')
    }
    this.options.protocols.forEach(protocol => {
      if (typeof protocol === 'string') {
        registerCustomProtocol(protocol)
        return
      }
      registerCustomProtocol(protocol.scheme, protocol.optionalSlashes)
    })
  },

  onDestroy() {
    reset()
  },

  addOptions() {
    return {
      autolink: true,
      linkOnPaste: false,
      protocols: [],
      defaultProtocol: 'http',
      openOnClick: true,
      enableClickSelection: false,
      HTMLAttributes: {
        target: '_blank',
        class: null,
        type: 'icon',
      },
      isAllowedUri: (url, ctx) => !!isAllowedUri(url, ctx.protocols),
      validate: url => !!url,
      shouldAutoLink: url => !!url,
    }
  },

  addAttributes() {
    return {
      href: {
        default: null,
        parseHTML: (element) => {
          return element.getAttribute('href')
        },
        renderHTML: (attributes) => {
          return {
            href: attributes.href,
          }
        },
      },
      target: {
        default: this.options.HTMLAttributes.target,
        parseHTML: (element) => {
          return element.getAttribute('target')
        },
        renderHTML: (attributes) => {
          return {
            target: attributes.target,
          }
        },
      },
      rel: {
        default: this.options.HTMLAttributes.rel,
        parseHTML: (element) => {
          return element.getAttribute('rel')
        },
        renderHTML: (attributes) => {
          return {
            rel: attributes.rel,
          }
        },
      },
      class: {
        default: this.options.HTMLAttributes.class,
        parseHTML: (element) => {
          return element.getAttribute('class')
        },
        renderHTML: (attributes) => {
          return {
            class: attributes.class,
          }
        },
      },
      title: {
        default: this.options.HTMLAttributes.title,
        parseHTML: (element) => {
          return (element as HTMLElement).textContent || element.getAttribute('title')
        },
        renderHTML: (attributes) => {
          return {
            'title': attributes.title,
          }
        },
      },
      type: {
        default: this.options.HTMLAttributes.type,
        parseHTML: (element) => {
          return element.getAttribute('type') || 'icon'
        },
        renderHTML: (attributes) => {
          return {
            'type': attributes.type,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'a',
        getAttrs: dom => {
          const href = (dom as HTMLElement).getAttribute('href')
          const dataType = (dom as HTMLElement).getAttribute('type')
          if (dataType === 'block') {
            return false
          }
          if (
            href &&
            !this.options.isAllowedUri(href, {
              defaultValidate: url => !!isAllowedUri(url, this.options.protocols),
              protocols: this.options.protocols,
              defaultProtocol: this.options.defaultProtocol,
            })
          ) {
            return false
          }
          return {
            href,
            target: dom.getAttribute('target') || this.options.HTMLAttributes.target,
            class: dom.getAttribute('class') || this.options.HTMLAttributes.class,
            rel: (dom as HTMLElement).getAttribute('rel'),
            title: (dom as HTMLElement).textContent || (dom as HTMLElement).getAttribute('title'),
            type: (dom as HTMLElement).getAttribute('type') || 'icon',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const title = HTMLAttributes.title || HTMLAttributes.href
    if (
      !this.options.isAllowedUri(HTMLAttributes.href, {
        defaultValidate: href => !!isAllowedUri(href, this.options.protocols),
        protocols: this.options.protocols,
        defaultProtocol: this.options.defaultProtocol,
      })
    ) {
      return ['a', mergeAttributes(this.options.HTMLAttributes, { ...HTMLAttributes, href: '' }), title]
    }

    return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), title]
  },

  addCommands() {
    return {
      setInlineLink: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
      toggleInlineLink: (options) => ({ chain }) => {
        return chain().toggleNode(this.name, 'a', options).run()
      },
      unsetInlineLink: () => ({ chain }) => {
        return chain().deleteNode(this.name).run()
      },
    }
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: text => {
          const foundLinks: PasteRuleMatch[] = []
          if (text) {
            const { protocols, defaultProtocol } = this.options
            const links = find(text).filter(
              item =>
                item.isLink &&
                this.options.isAllowedUri(item.value, {
                  defaultValidate: href => !!isAllowedUri(href, protocols),
                  protocols,
                  defaultProtocol,
                }),
            )
            if (links.length) {
              links.forEach(link =>
                foundLinks.push({
                  text: link.value,
                  data: {
                    href: link.href,
                  },
                  index: link.start,
                }),
              )
            }
          }
          return foundLinks
        },
        type: this.type,
        getAttributes: match => {
          return {
            href: match.data?.href,
          }
        },
      }),
    ]
  },

  addProseMirrorPlugins() {
    const plugins: Plugin[] = []
    const { protocols, defaultProtocol } = this.options
    if (this.options.autolink) {
      plugins.push(
        autolink({
          type: this.type,
          defaultProtocol: this.options.defaultProtocol,
          validate: url =>
            this.options.isAllowedUri(url, {
              defaultValidate: href => !!isAllowedUri(href, protocols),
              protocols,
              defaultProtocol,
            }),
          shouldAutoLink: this.options.shouldAutoLink,
        }),
      )
    }
    if (this.options.openOnClick === true) {
      plugins.push(
        clickHandler({
          type: this.type,
          editor: this.editor,
          enableClickSelection: this.options.enableClickSelection,
        }),
      )
    }
    if (this.options.linkOnPaste) {
      plugins.push(
        pasteHandler({
          editor: this.editor,
          defaultProtocol: this.options.defaultProtocol,
          type: this.type,
        }),
      )
    }
    return plugins
  },

  addKeyboardShortcuts() {
    return {
      'Mod-1': () => {
        return this.editor.commands.setInlineLink({ href: '', type: 'icon' })
      }
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkViewWrapper)
  },
})

export const BlockLinkExtension = Node.create({
  name: 'blockLink',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        target: '_blank',
        class: null,
        type: 'block',
      },
    }
  },

  addAttributes() {
    return {
      href: {
        default: null,
        parseHTML: element => element.getAttribute('href'),
        renderHTML: attributes => {
          if (!attributes.href) {
            return {}
          }
          return {
            href: attributes.href,
          }
        },
      },
      target: {
        default: this.options.HTMLAttributes.target,
        parseHTML: element => element.getAttribute('target'),
        renderHTML: attributes => {
          if (!attributes.target) {
            return {}
          }
          return {
            target: attributes.target,
          }
        },
      },
      class: {
        default: this.options.HTMLAttributes.class,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.class) {
            return {}
          }
          return {
            class: attributes.class,
          }
        },
      },
      title: {
        default: null,
        parseHTML: element => (element as HTMLElement).textContent || element.getAttribute('title'),
        renderHTML: attributes => {
          if (!attributes.title) {
            return {}
          }
          return {
            title: attributes.title,
          }
        },
      },
      rel: {
        default: null,
        parseHTML: element => element.getAttribute('rel'),
        renderHTML: attributes => {
          if (!attributes.rel) {
            return {}
          }
          return {
            rel: attributes.rel,
          }
        },
      },
      type: {
        default: 'block',
        parseHTML: element => element.getAttribute('type') || 'block',
        renderHTML: attributes => {
          return {
            'type': attributes.type,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'a[type="block"]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false
          return {
            href: dom.getAttribute('href') || '',
            target: dom.getAttribute('target') || this.options.HTMLAttributes.target,
            class: dom.getAttribute('class') || this.options.HTMLAttributes.class,
            title: (dom as HTMLElement).textContent || dom.getAttribute('title') || '',
            rel: dom.getAttribute('rel') || '',
            type: dom.getAttribute('type') || 'block',
          }
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const title = HTMLAttributes.title || HTMLAttributes.href
    return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), title]
  },

  addCommands() {
    return {
      setBlockLink: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkViewWrapper)
  },
})