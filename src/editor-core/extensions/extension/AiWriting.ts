import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view'

export interface AiWritingOptions {
  // 触发请求前的最小字符数（避免空文、极短文本触发）
  minChars?: number
  // 防抖毫秒，默认 1000ms
  debounceMs?: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiWriting: {
      setAiWriting: (enabled: boolean) => ReturnType
    }
  }
  interface Storage {
    aiWriting: {
      enabled: boolean
    }
  }
}

type SuggestionState = {
  enabled: boolean
  pos: number | null
  text: string
  decorations: DecorationSet
  lastDocText: string
  lastTriggerPos: number | null
}

const aiWritingPluginKey = new PluginKey<SuggestionState>('aiWritingPlugin')

// 简单防抖
function debounce<F extends (...args: any[]) => void>(fn: F, wait: number) {
  let timer: any = null
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}

function getFullText(view: EditorView): string {
  const { doc } = view.state
  return (doc as any).textBetween(0, doc.content.size, '\n', '\n') as string
}

function isAtEndWithNoContentAfter(view: EditorView): boolean {
  const { state } = view
  const { selection, doc } = state
  if (!selection.empty) return false
  // 基于当前行：从光标到下一处换行（或文末）之间是否仅为空白
  const suffixFromCursor = (doc as any).textBetween(selection.from, doc.content.size, '\n', '\n') as string
  const nextNewlineIndex = suffixFromCursor.indexOf('\n')
  const currentLineAfterCursor = nextNewlineIndex >= 0
    ? suffixFromCursor.slice(0, nextNewlineIndex)
    : suffixFromCursor
  return currentLineAfterCursor.trim().length === 0
}

function createSuggestionWidget(text: string) {
  const dom = document.createElement('span')
  dom.className = 'ai-writing-suggestion'
  dom.textContent = text
  return dom
}

export const AiWritingExtension = (props: { onAiWritingGetSuggestion?: ({ prefix, suffix }: { prefix: string, suffix: string }) => Promise<string> }) => Extension.create<AiWritingOptions>({
  name: 'aiWriting',

  addOptions() {
    return {
      minChars: 0,
      debounceMs: 1000,
    }
  },

  addStorage() {
    return {
      enabled: false as boolean,
    }
  },

  addCommands() {
    return {
      setAiWriting: (enabled: boolean) => ({ tr, dispatch }) => {
        if (dispatch) {
          const meta = { type: 'setEnabled', enabled }
          dispatch(tr.setMeta(aiWritingPluginKey, meta))
          this.storage.enabled = !!enabled
        }
        return true
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        const pluginState = aiWritingPluginKey.getState(this.editor.state)
        if (!pluginState || !pluginState.enabled) return false
        const { text, pos } = pluginState
        if (!text || text.length === 0 || pos == null) return false

        return this.editor.commands.command(({ tr, state, dispatch }) => {
          if (!dispatch) return true
          const insertPos = state.selection.from
          const { schema } = state
          const segments = text.split('\n')
          let posCursor = insertPos
          for (let i = 0; i < segments.length; i++) {
            const segment = segments[i]
            if (segment.length > 0) {
              tr.insertText(segment, posCursor)
              posCursor += segment.length
            }
            if (i < segments.length - 1) {
              const br = schema.nodes.hardBreak.create()
              tr.insert(posCursor, br as any)
              posCursor += 1
            }
          }
          // 接受后清空建议
          dispatch(tr.setMeta(aiWritingPluginKey, { type: 'clearSuggestion' }))
          return true
        })
      },
    }
  },

  addProseMirrorPlugins() {
    const minChars = this.options.minChars ?? 1
    const debounceMs = this.options.debounceMs ?? 1000

    let debouncedRequest: ((view: EditorView) => void) | null = null

    const request = async (view: EditorView) => {
      const state = aiWritingPluginKey.getState(view.state)
      if (!state || !state.enabled) return
      if (!isAtEndWithNoContentAfter(view)) return

      const text = getFullText(view)
      if ((text?.length || 0) < minChars) return
      // 空文档不触发
      if (!text || text.trim().length === 0) return

      // 避免重复请求同一内容与同一光标位置
      const from = (view.state as any).selection.from as number
      if (state.lastDocText === text && state.lastTriggerPos === from) return

      let suggestion = ''
      try {
        const { doc } = view.state as any
        const prefix = (doc as any).textBetween(0, from, '\n', '\n') as string
        const suffix = (doc as any).textBetween(from, doc.content.size, '\n', '\n') as string
        suggestion = await props.onAiWritingGetSuggestion?.({ prefix, suffix }) ?? ''
      } catch (error) {
        console.error('getSuggestion error', error)
      }

      const tr = view.state.tr.setMeta(aiWritingPluginKey, {
        type: 'setSuggestion',
        text: suggestion,
        pos: view.state.selection.from,
        lastDocText: text,
        lastTriggerPos: from,
      })
      view.dispatch(tr)
    }

    const ensureDebounced = () => {
      if (!debouncedRequest) {
        debouncedRequest = debounce((view: EditorView) => request(view), debounceMs)
      }
      return debouncedRequest
    }

    return [
      new Plugin<SuggestionState>({
        key: aiWritingPluginKey,
        state: {
          init: (_config, state) => ({
            enabled: false,
            pos: null,
            text: '',
            decorations: DecorationSet.create(state.doc, []),
            lastDocText: '',
            lastTriggerPos: null,
          }),
          apply: (tr, pluginState, _old, newState) => {
            let next = pluginState

            // 装饰位置随映射移动
            if (tr.docChanged) {
              const mapped = pluginState.decorations.map(tr.mapping, tr.doc)
              next = { ...next, decorations: mapped }
              // 用户输入则清空建议（除非是我们主动 setSuggestion 立即覆盖）
              if (!tr.getMeta(aiWritingPluginKey)) {
                next = { ...next, text: '', pos: null, decorations: DecorationSet.create(newState.doc, []), lastTriggerPos: null }
              }
            }

            const meta = tr.getMeta(aiWritingPluginKey)
            if (meta) {
              switch (meta.type) {
                case 'setEnabled': {
                  const enabled = !!meta.enabled
                  // 关闭时清空
                  const cleared = enabled ? next.decorations : DecorationSet.create(newState.doc, [])
                  return { ...next, enabled, text: enabled ? next.text : '', pos: enabled ? next.pos : null, decorations: cleared, lastTriggerPos: enabled ? next.lastTriggerPos : null }
                }
                case 'setSuggestion': {
                  const text: string = meta.text || ''
                  const pos: number | null = typeof meta.pos === 'number' ? meta.pos : null
                  const lastDocText: string = meta.lastDocText ?? next.lastDocText
                  const lastTriggerPos: number | null = typeof meta.lastTriggerPos === 'number' ? meta.lastTriggerPos : next.lastTriggerPos
                  if (!text || pos == null) {
                    return { ...next, text: '', pos: null, decorations: DecorationSet.create(newState.doc, []), lastDocText, lastTriggerPos }
                  }
                  const deco = Decoration.widget(pos, () => createSuggestionWidget(text), { side: 1, ignoreSelection: true })
                  const decoSet = DecorationSet.create(newState.doc, [deco])
                  return { ...next, text, pos, decorations: decoSet, lastDocText, lastTriggerPos }
                }
                case 'clearSuggestion': {
                  return { ...next, text: '', pos: null, decorations: DecorationSet.create(newState.doc, []), lastTriggerPos: null }
                }
              }
            }

            return next
          },
        },
        view: (view) => {
          // 每次视图更新时尝试触发请求（防抖）
          const handler = () => {
            const state = aiWritingPluginKey.getState(view.state)
            if (!state || !state.enabled) return
            const currentPos = view.state.selection.from
            // 若光标位置与建议位置不同且有建议，先清空（视为拒绝）
            if (state.text && state.pos != null && state.pos !== currentPos) {
              view.dispatch(view.state.tr.setMeta(aiWritingPluginKey, { type: 'clearSuggestion' }))
            }
            if (!isAtEndWithNoContentAfter(view)) return
            ensureDebounced()(view)
          }

          handler()

          return {
            update: handler,
            destroy: () => {
              // noop
            },
          }
        },
        props: {
          decorations: (state) => aiWritingPluginKey.getState(state)?.decorations || null,
          // 用户任意输入时隐藏建议（例如组合键输入不一定触发 docChanged 前）
          handleKeyDown: (view, event) => {
            const ps = aiWritingPluginKey.getState(view.state)
            if (!ps || !ps.enabled) return false
            // Tab 的处理放在 addKeyboardShortcuts
            if (event.key === 'Tab') return false
            if (ps.text) {
              // 任何按键都清空（如箭头、字符、Enter 等），让体验更贴近代码编辑器
              view.dispatch(view.state.tr.setMeta(aiWritingPluginKey, { type: 'clearSuggestion' }))
            }
            return false
          },
        },
      }),
    ]
  },
})

export type { SuggestionState }


