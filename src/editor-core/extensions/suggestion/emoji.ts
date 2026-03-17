import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import { EmojiItem, EmojiOptions } from '@tiptap/extension-emoji'
import { Editor, ReactRenderer } from '@tiptap/react'
import { SuggestionProps } from '@tiptap/suggestion'
import { EmojiList, EmojiListProps, EmojiListRef } from '../component/EmojiList'

export const emojiSuggestion: EmojiOptions["suggestion"] = {
  allowSpaces: false,
  items: ({ editor, query }: { editor: Editor, query: string }) => {
    const normalizedQuery = query.toLowerCase().trim()

    if (!normalizedQuery) {
      // 如果没有查询，返回所有 emoji（限制数量以避免性能问题）
      return editor.storage.emoji.emojis.slice(0, 200)
    }

    // 优化搜索：优先匹配开头，其次匹配包含
    return editor.storage.emoji.emojis
      .map((item: EmojiItem) => {
        const { shortcodes = [], tags = [] } = item
        let score = 0

        // 检查 shortcodes 和 tags
        const allMatches = [
          ...shortcodes.map((s: string) => s.toLowerCase()),
          ...tags.map((t: string) => t.toLowerCase())
        ]

        // 计算匹配分数
        const exactStart = allMatches.some(m => m === normalizedQuery)
        const startsWith = allMatches.some(m => m.startsWith(normalizedQuery))
        const includes = allMatches.some(m => m.includes(normalizedQuery))

        if (exactStart) score = 3
        else if (startsWith) score = 2
        else if (includes) score = 1
        else score = 0

        return { item, score }
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score) // 按分数排序
      .map(({ item }) => item)
      .slice(0, 100) // 限制结果数量
  },
  render: () => {
    let component: ReactRenderer<EmojiListRef, EmojiListProps> | null = null
    let cleanupAutoUpdate: (() => void) | null = null
    let isMouseOver = false
    let shouldClose = false
    let currentProps: SuggestionProps<any> | null = null

    const updatePosition = (editor: Editor, element: HTMLElement, clientRect: DOMRect | null) => {
      if (!clientRect) return

      const virtualElement = {
        getBoundingClientRect: () => clientRect,
      }

      computePosition(virtualElement, element, {
        placement: 'bottom-start',
        strategy: 'absolute',
        middleware: [
          offset(4),
          flip(),
          shift({ padding: 8 }),
        ],
      }).then(({ x, y }) => {
        element.style.position = 'absolute'
        element.style.left = `${x}px`
        element.style.top = `${y}px`
      })
    }

    return {
      onStart: (props: SuggestionProps<any>) => {
        currentProps = props
        shouldClose = false
        component = new ReactRenderer(EmojiList, {
          props: {
            ...props,
            query: props.query || '',
            editor: props.editor,
            command: (commandProps: { name: string }) => {
              // 标记应该关闭，然后调用原始 command
              shouldClose = true
              props.command(commandProps)
            },
          },
          editor: props.editor,
        })
        const clientRect = props.clientRect?.()
        if (!clientRect) return
        const element = component.element as HTMLElement
        document.body.appendChild(element)

        // 添加鼠标事件监听
        const handleMouseEnter = () => {
          isMouseOver = true
        }
        const handleMouseLeave = () => {
          isMouseOver = false
        }

        element.addEventListener('mouseenter', handleMouseEnter)
        element.addEventListener('mouseleave', handleMouseLeave)

        // 初始定位
        updatePosition(props.editor, element, clientRect)

        // 设置自动更新位置
        const virtualElement = {
          getBoundingClientRect: () => {
            const rect = currentProps?.clientRect?.()
            return rect || new DOMRect()
          },
        }
        cleanupAutoUpdate = autoUpdate(virtualElement, element, () => {
          const rect = currentProps?.clientRect?.()
          if (rect) {
            updatePosition(props.editor, element, rect)
          }
        })
      },
      onUpdate(props: SuggestionProps<any>) {
        currentProps = props
        if (!component) return
        shouldClose = false
        component.updateProps({
          ...props,
          query: props.query || '',
          editor: props.editor,
          command: (commandProps: { name: string }) => {
            // 标记应该关闭，然后调用原始 command
            shouldClose = true
            props.command(commandProps)
          },
        })
        const clientRect = props.clientRect?.()
        if (!clientRect) return
        updatePosition(props.editor, component.element as HTMLElement, clientRect)
      },
      onKeyDown(props: { event: KeyboardEvent }) {
        if (!component) return false
        if (props.event.key === 'Escape') {
          if (cleanupAutoUpdate) {
            cleanupAutoUpdate()
            cleanupAutoUpdate = null
          }
          component.element.remove()
          component.destroy()
          return true
        }
        return component.ref?.onKeyDown(props) || false
      },
      onExit() {
        if (!component) return

        // 如果用户已经选择了 emoji，应该关闭
        if (shouldClose) {
          if (cleanupAutoUpdate) {
            cleanupAutoUpdate()
            cleanupAutoUpdate = null
          }
          component.destroy()
          component.element.remove()
          return
        }

        // 如果鼠标在弹框内，不关闭
        if (isMouseOver) {
          return
        }

        if (cleanupAutoUpdate) {
          cleanupAutoUpdate()
          cleanupAutoUpdate = null
        }
        component.destroy()
        component.element.remove()
      },
    }
  },
}

export default emojiSuggestion