

import { InputRule, mergeAttributes, Node } from '@tiptap/core'
import { Plugin, PluginKey, Selection, TextSelection } from '@tiptap/pm/state'

const DEFAULT_TAB_SIZE = 4

export interface YamlFormatOptions {
  /**
   * Define whether the node should be exited on triple enter.
   * @default true
   */
  exitOnTripleEnter: boolean | null | undefined
  /**
   * Define whether the node should be exited on arrow down if there is no node after it.
   * @default true
   */
  exitOnArrowDown: boolean | null | undefined
  /**
   * Enable tab key for indentation in code blocks.
   * @default false
   */
  enableTabIndentation: boolean | null | undefined
  /**
   * The number of spaces to use for tab indentation.
   * @default 4
   */
  tabSize: number | null | undefined
  /**
   * Custom HTML attributes that should be added to the rendered HTML tag.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    yamlFormat: {
      /**
       * Set a yaml format
       * @example editor.commands.setYamlFormat()
       */
      setYamlFormat: () => ReturnType
      /**
       * Toggle a yaml format
       * @example editor.commands.toggleYamlFormat()
       */
      toggleYamlFormat: () => ReturnType
    }
  }
}

/**
 * Matches a yaml format with backticks.
 * Only matches exactly `--- ` (three dashes followed by a space)
 */
export const yamlInputRegex = /^---\s$/

/**
 * This extension allows you to create yaml format.
 * @see https://tiptap.dev/api/nodes/code-block
 */
export const YamlFormat = Node.create<YamlFormatOptions>({
  name: 'yamlFormat',

  addOptions() {
    return {
      exitOnTripleEnter: true,
      exitOnArrowDown: true,
      enableTabIndentation: false,
      tabSize: DEFAULT_TAB_SIZE,
      HTMLAttributes: {},
    }
  },

  content: 'text*',

  marks: '',

  group: 'block',

  code: true,

  defining: true,

  addAttributes() {
    return {
    }
  },

  parseHTML() {
    return [
      {
        tag: 'pre[data-type="yaml-frontmatter"]',
        preserveWhitespace: 'full',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'pre',
      mergeAttributes({ 'data-type': 'yaml-frontmatter' }, this.options.HTMLAttributes, HTMLAttributes),
      [
        'code',
        {},
        0,
      ],
    ]
  },

  markdownTokenName: 'frontmatter',

  parseMarkdown: (token, helpers) => {
    if (token.raw?.startsWith('---') === false) {
      return []
    }

    return helpers.createNode(
      'yamlFormat',
      {},
      token.text ? [helpers.createTextNode(token.text)] : [],
    )
  },

  renderMarkdown: (node, h) => {
    const content = node.content ? h.renderChildren(node.content) : ''
    if (!content) {
      return `---\n---`
    }
    return `---\n${content}\n---`
  },

  addCommands() {
    return {
      setYamlFormat: () => (ctx: any) => {
        return ctx.commands.setNode(this.name, {})
      },
      toggleYamlFormat: () => (ctx: any) => {
        return ctx.commands.toggleNode(this.name, 'paragraph', {})
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { empty, $anchor } = this.editor.state.selection
        const isAtStart = $anchor.pos === 1

        if (!empty || $anchor.parent.type.name !== this.name) {
          return false
        }

        if (isAtStart || !$anchor.parent.textContent.length) {
          return this.editor.commands.clearNodes()
        }

        return false
      },
      Tab: ({ editor }) => {
        if (!this.options.enableTabIndentation) {
          return false
        }

        const tabSize = this.options.tabSize ?? DEFAULT_TAB_SIZE
        const { state } = editor
        const { selection } = state
        const { $from, empty } = selection

        if ($from.parent.type !== this.type) {
          return false
        }

        const indent = ' '.repeat(tabSize)

        if (empty) {
          return editor.commands.insertContent(indent)
        }

        return editor.commands.command(({ tr }) => {
          const { from, to } = selection
          const text = state.doc.textBetween(from, to, '\n', '\n')
          const lines = text.split('\n')
          const indentedText = lines.map(line => indent + line).join('\n')

          tr.replaceWith(from, to, state.schema.text(indentedText))
          return true
        })
      },

      'Shift-Tab': ({ editor }) => {
        if (!this.options.enableTabIndentation) {
          return false
        }

        const tabSize = this.options.tabSize ?? DEFAULT_TAB_SIZE
        const { state } = editor
        const { selection } = state
        const { $from, empty } = selection

        if ($from.parent.type !== this.type) {
          return false
        }

        if (empty) {
          return editor.commands.command(({ tr }) => {
            const { pos } = $from
            const yamlFormatStart = $from.start()
            const yamlFormatEnd = $from.end()

            const allText = state.doc.textBetween(yamlFormatStart, yamlFormatEnd, '\n', '\n')
            const lines = allText.split('\n')

            let currentLineIndex = 0
            let charCount = 0
            const relativeCursorPos = pos - yamlFormatStart

            for (let i = 0; i < lines.length; i += 1) {
              if (charCount + lines[i].length >= relativeCursorPos) {
                currentLineIndex = i
                break
              }
              charCount += lines[i].length + 1
            }

            const currentLine = lines[currentLineIndex]
            const leadingSpaces = currentLine.match(/^ */)?.[0] || ''
            const spacesToRemove = Math.min(leadingSpaces.length, tabSize)

            if (spacesToRemove === 0) {
              return true
            }

            let lineStartPos = yamlFormatStart
            for (let i = 0; i < currentLineIndex; i += 1) {
              lineStartPos += lines[i].length + 1
            }

            tr.delete(lineStartPos, lineStartPos + spacesToRemove)

            const cursorPosInLine = pos - yamlFormatStart
            if (cursorPosInLine <= spacesToRemove) {
              tr.setSelection(TextSelection.create(tr.doc, yamlFormatStart))
            }

            return true
          })
        }

        return editor.commands.command(({ tr }) => {
          const { from, to } = selection
          const text = state.doc.textBetween(from, to, '\n', '\n')
          const lines = text.split('\n')
          const reverseIndentText = lines
            .map(line => {
              const leadingSpaces = line.match(/^ */)?.[0] || ''
              const spacesToRemove = Math.min(leadingSpaces.length, tabSize)
              return line.slice(spacesToRemove)
            })
            .join('\n')

          tr.replaceWith(from, to, state.schema.text(reverseIndentText))
          return true
        })
      },

      Enter: ({ editor }) => {
        if (!this.options.exitOnTripleEnter) {
          return false
        }

        const { state } = editor
        const { selection } = state
        const { $from, empty } = selection

        if (!empty || $from.parent.type !== this.type) {
          return false
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2
        const endsWithDoubleNewline = $from.parent.textContent.endsWith('\n\n')

        if (!isAtEnd || !endsWithDoubleNewline) {
          return false
        }

        return editor
          .chain()
          .command(({ tr }) => {
            tr.delete($from.pos - 2, $from.pos)

            return true
          })
          .exitCode()
          .run()
      },

      ArrowDown: ({ editor }) => {
        if (!this.options.exitOnArrowDown) {
          return false
        }

        const { state } = editor
        const { selection, doc } = state
        const { $from, empty } = selection

        if (!empty || $from.parent.type !== this.type) {
          return false
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2

        if (!isAtEnd) {
          return false
        }

        const after = $from.after()

        if (after === undefined) {
          return false
        }

        const nodeAfter = doc.nodeAt(after)

        if (nodeAfter) {
          return editor.commands.command(({ tr }) => {
            tr.setSelection(Selection.near(doc.resolve(after)))
            return true
          })
        }

        return editor.commands.exitCode()
      },
    }
  },

  addInputRules() {
    return [
      new InputRule({
        find: yamlInputRegex,
        handler: ({ state, range, chain }) => {
          if (range.from !== 1) {
            return null
          }
          chain()
            .command(({ tr }) => {
              tr.delete(range.from, range.to)
              return true
            })
            .setNode(this.name, {})
            .run()
        },
      }),
    ]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('yamlFormatHandler'),
        props: {
          handlePaste: (view, event) => {
            if (!event.clipboardData) {
              return false
            }

            if (this.editor.isActive(this.type.name)) {
              return false
            }

            const text = event.clipboardData.getData('text/plain')

            if (!text) {
              return false
            }

            const { tr, schema } = view.state
            const isAtDocStart = view.state.selection.$from.pos === 1
            const fmRegex = /^-{3,}\s*\n([\s\S]*?)\n-{3,}\s*$/
            const match = fmRegex.exec(text.replace(/\r\n?/g, '\n'))

            if (!isAtDocStart || !match) {
              return false
            }

            const content = match[1] || ''
            const textNode = schema.text(content)
            const node = this.type.create({}, textNode)

            tr.replaceSelectionWith(node)

            if (tr.selection.$from.parent.type !== this.type) {
              tr.setSelection(TextSelection.near(tr.doc.resolve(Math.max(0, tr.selection.from - 2))))
            }

            tr.setMeta('paste', true)

            view.dispatch(tr)

            return true
          },
        },
        appendTransaction: (transactions, oldState, newState) => {
          const docChanged = transactions.some(tr => tr.docChanged)
          if (!docChanged) {
            return null
          }
          const { doc } = newState
          const firstNode = doc.firstChild
          if (!firstNode || firstNode.type.name !== 'horizontalRule') {
            return null
          }
          const isInitialLoad = transactions.some(tr => {
            const addToHistory = tr.getMeta('addToHistory')
            const isPasteHandled = tr.getMeta('paste')
            return (addToHistory === false || addToHistory === undefined) && !isPasteHandled
          })
          if (!isInitialLoad) {
            return null
          }
          doc.descendants((node, pos) => {
            return true
          })
          const secondNode = doc.maybeChild(1)
          const isSecondNodeHeading = secondNode && secondNode.type.name === 'heading' && (secondNode as any).attrs?.level === 2
          if (isSecondNodeHeading) {
            const tr = newState.tr
            const replaceEnd = firstNode.nodeSize + secondNode.nodeSize
            let yamlContent = ''
            doc.nodesBetween(firstNode.nodeSize, replaceEnd, (node, pos) => {
              if (node.isText && node.text) {
                yamlContent += node.text
              }
            })
            yamlContent = yamlContent.trim()
            const textNode = yamlContent ? newState.schema.text(yamlContent) : undefined
            const yamlNode = this.type.create({}, textNode ? [textNode] : [])
            tr.replaceRangeWith(0, replaceEnd, yamlNode)
            return tr
          }
          return null
        },
      }),
    ]
  },
})