/* eslint-disable @typescript-eslint/no-unused-vars */
import { TocList } from '../../../../types'
import type { Editor } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import type { Node as TiptapNode } from '@tiptap/pm/model'
import { v4 as uuidv4 } from 'uuid'
import { TableOfContentsPlugin } from './plugin'
import { GetTableOfContentIndexFunction, GetTableOfContentLevelFunction, TableOfContentData, TableOfContentDataItem, TableOfContentsOptions, TableOfContentsStorage } from './types'
import { getHeadlineLevel, getHierarchicalIndexes, getLinearIndexes } from './util'
export * from './types'

// 全局组合状态管理，避免在 IME 组合期间触发 TOC 更新
let globalCompositionState = false
let globalCompositionEndTimer: ReturnType<typeof setTimeout> | null = null
let globalInputTimer: ReturnType<typeof setTimeout> | null = null
let lastInputTime = 0

// 全局监听组合状态和输入事件
if (typeof document !== 'undefined') {
  document.addEventListener('compositionstart', () => {
    globalCompositionState = true
  }, { passive: true })

  document.addEventListener('compositionend', () => {
    globalCompositionState = false
    // 组合结束后，延迟刷新所有 TOC 实例
    if (globalCompositionEndTimer) {
      clearTimeout(globalCompositionEndTimer)
    }
    globalCompositionEndTimer = setTimeout(() => {
      // 这里会通过 editor 实例来触发刷新
      // 具体实现在 onTransaction 中处理
    }, 200)
  }, { passive: true })

  // 监听所有输入事件，记录最后输入时间
  document.addEventListener('input', () => {
    lastInputTime = Date.now()
  }, { passive: true })

  document.addEventListener('keydown', () => {
    lastInputTime = Date.now()
  }, { passive: true })
}

const addTocActiveStatesAndGetItems = (
  content: TableOfContentDataItem[],
  options: {
    editor: Editor
    anchorTypes: Array<string> | undefined
    storage: TableOfContentsStorage
  },
) => {
  const { editor } = options
  const headlines: Array<{ node: TiptapNode; pos: number }> = []
  const scrolledOverIds: string[] = []
  let activeId: string | null = null

  if (editor.isDestroyed) {
    return content
  }

  editor.state.doc.descendants((node, pos) => {
    const isValidType = options.anchorTypes?.includes(node.type.name)

    if (!isValidType) {
      return
    }

    headlines.push({ node, pos })
  })

  headlines.forEach(headline => {
    const domElement = editor.view.domAtPos(headline.pos + 1).node as HTMLHeadingElement | HTMLElement
    const scrolledOver = options.storage.scrollPosition >= domElement.offsetTop

    if (scrolledOver) {
      activeId = headline.node.attrs.id
      scrolledOverIds.push(headline.node.attrs.id)
    }
  })

  return content.map(heading => ({
    ...heading,
    isActive: heading.id === activeId,
    isScrolledOver: scrolledOverIds.includes(heading.id),
  }))
}

const setTocData = (options: {
  editor: Editor
  anchorTypes: Array<string> | undefined
  getIndexFn: GetTableOfContentIndexFunction
  getLevelFn: GetTableOfContentLevelFunction
  storage: TableOfContentsStorage
  onUpdate?: (data: TableOfContentData, isCreate?: boolean) => void | undefined
  getId: (textContent: string) => string
}) => {
  const { editor, onUpdate } = options

  if (editor.isDestroyed) {
    return
  }

  const headlines: Array<{ node: TiptapNode; pos: number }> = []
  let anchors: TableOfContentDataItem[] = []
  const anchorEls: Array<HTMLHeadingElement | HTMLElement> = []

  editor.state.doc.descendants((node, pos) => {
    const isValidType = options.anchorTypes?.includes(node.type.name)

    if (!isValidType) {
      return
    }

    headlines.push({ node, pos })
  })

  headlines.forEach((headline) => {
    if (headline.node.textContent.length === 0) {
      return
    }

    const domElement = editor.view.domAtPos(headline.pos + 1).node as HTMLHeadingElement
    const scrolledOver = options.storage.scrollPosition >= domElement.offsetTop

    anchorEls.push(domElement)

    const originalLevel = headline.node.attrs.level
    const level = options.getLevelFn(headline, anchors)
    const itemIndex = options.getIndexFn(headline, anchors, level)

    anchors.push({
      itemIndex,
      id: headline.node.attrs.id || options.getId(headline.node.textContent),
      originalLevel,
      level,
      textContent: headline.node.textContent,
      pos: headline.pos,
      editor,
      isActive: false,
      isScrolledOver: scrolledOver,
      node: headline.node,
      dom: domElement,
    })
  })

  // 计算 active 和 scrolledOver 状态
  anchors = addTocActiveStatesAndGetItems(anchors, {
    editor: options.editor,
    anchorTypes: options.anchorTypes,
    storage: options.storage,
  })

  // 更新存储
  options.storage.anchors = anchorEls
  options.storage.content = anchors

  // 调用回调
  if (onUpdate) {
    const isInitialCreation = options.storage.content.length === 0
    onUpdate(anchors, isInitialCreation)
  }
}

export const TableOfContentsExtension = Extension.create<TableOfContentsOptions, TableOfContentsStorage>({
  name: 'tableOfContents',

  addStorage() {
    return {
      content: [],
      anchors: [],
      scrollHandler: () => null,
      scrollPosition: 0,
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: (this.options.anchorTypes as string[]) || ['heading'],
        attributes: {
          id: {
            default: null,
            renderHTML: attributes => {
              return {
                id: attributes.id,
              }
            },
            parseHTML: element => {
              return element.id || null
            },
          },
        },
      },
    ]
  },

  addOptions() {
    const defaultScrollParent = typeof window !== 'undefined' ? () => window : undefined

    return {
      // eslint-disable-next-line
      onUpdate: () => { },
      // eslint-disable-next-line
      getId: _textContent => uuidv4(),

      scrollParent: defaultScrollParent,

      anchorTypes: ['heading'],
    }
  },

  addCommands() {
    return {
      updateTableOfContents:
        () =>
          ({ dispatch }) => {
            if (dispatch) {
              setTocData({
                editor: this.editor,
                storage: this.storage,
                onUpdate: this.options.onUpdate?.bind(this),
                getIndexFn: this.options.getIndex || getLinearIndexes,
                getLevelFn: this.options.getLevel || getHeadlineLevel,
                anchorTypes: this.options.anchorTypes,
                getId: this.options.getId || ((textContent: string) => uuidv4()),
              })
            }

            return true
          },
    }
  },

  onTransaction({ transaction }) {
    if (!transaction.docChanged) return

    const now = Date.now()
    const timeSinceLastInput = now - lastInputTime

    // 组合期间完全不处理 TOC 更新，避免打断输入
    if (globalCompositionState || this.editor.view.composing) {
      return
    }

    // 如果最近有输入（1秒内），延迟处理
    if (timeSinceLastInput < 1000) {
      if (globalInputTimer) {
        clearTimeout(globalInputTimer)
      }
      globalInputTimer = setTimeout(() => {
        // 再次检查组合状态
        if (!globalCompositionState && !this.editor.view.composing) {
          setTocData({
            editor: this.editor,
            storage: this.storage,
            onUpdate: this.options.onUpdate?.bind(this),
            getIndexFn: this.options.getIndex || getLinearIndexes,
            getLevelFn: this.options.getLevel || getHeadlineLevel,
            anchorTypes: this.options.anchorTypes,
            getId: this.options.getId || ((textContent: string) => uuidv4()),
          })
        }
      }, 1000 - timeSinceLastInput + 200)
      return
    }

    // 非组合期间且无最近输入，使用 setTimeout 确保有足够延迟
    setTimeout(() => {
      // 再次检查，确保组合状态没有变化
      if (!globalCompositionState && !this.editor.view.composing) {
        setTocData({
          editor: this.editor,
          storage: this.storage,
          onUpdate: this.options.onUpdate?.bind(this),
          getIndexFn: this.options.getIndex || getLinearIndexes,
          getLevelFn: this.options.getLevel || getHeadlineLevel,
          anchorTypes: this.options.anchorTypes,
          getId: this.options.getId || ((textContent: string) => uuidv4()),
        })
      }
    }, 100)
  },

  onCreate() {
    const { tr } = this.editor.state
    const existingIds: string[] = []

    if (this.options.scrollParent && typeof this.options.scrollParent !== 'function') {
      console.warn(
        "[Tiptap Table of Contents Deprecation Notice]: The 'scrollParent' option must now be provided as a callback function that returns the 'scrollParent' element. The ability to pass this option directly will be deprecated in future releases.",
      )
    }

    // 异步处理初始 ID 分配，避免与初始输入竞争
    requestAnimationFrame(() => {
      this.editor.state.doc.descendants((node, pos) => {
        const nodeId = node.attrs.id
        const isValidType = this.options.anchorTypes?.includes(node.type.name)

        if (!isValidType || node.textContent.length === 0) {
          return
        }

        if (nodeId === null || nodeId === undefined || existingIds.includes(nodeId)) {
          let id = ''

          if (this.options.getId) {
            id = this.options.getId(node.textContent)
          } else {
            id = uuidv4()
          }

          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            id,
          })
        }

        existingIds.push(nodeId)
      })

      this.editor.view.dispatch(tr)

      // 延迟初始化 TOC 数据
      setTimeout(() => {
        setTocData({
          editor: this.editor,
          storage: this.storage,
          onUpdate: this.options.onUpdate?.bind(this),
          getIndexFn: this.options.getIndex || getLinearIndexes,
          getLevelFn: this.options.getLevel || getHeadlineLevel,
          anchorTypes: this.options.anchorTypes,
          getId: this.options.getId || ((textContent: string) => uuidv4()),
        })
      }, 100)
    })

    // 防抖的 scroll handler，避免滚动期间频繁触发回调
    let scrollTimer: ReturnType<typeof setTimeout> | null = null
    this.storage.scrollHandler = () => {
      if (!this.options.scrollParent) {
        return
      }

      const scrollParent =
        typeof this.options.scrollParent === 'function' ? this.options.scrollParent() : this.options.scrollParent

      const scrollPosition = scrollParent instanceof HTMLElement ? scrollParent.scrollTop : scrollParent.scrollY

      this.storage.scrollPosition = scrollPosition || 0

      if (scrollTimer) clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        const updatedItems = addTocActiveStatesAndGetItems(this.storage.content, {
          editor: this.editor,
          anchorTypes: this.options.anchorTypes,
          storage: this.storage,
        })
        this.storage.content = updatedItems
        // 调用 onUpdate 回调
        this.options.onUpdate?.(updatedItems, false)
      }, 100)
    }

    // 添加滚动监听
    if (this.options.scrollParent) {
      const scrollParent =
        typeof this.options.scrollParent === 'function' ? this.options.scrollParent() : this.options.scrollParent

      if (scrollParent) {
        scrollParent.addEventListener('scroll', this.storage.scrollHandler)
      }
    }
  },

  onDestroy() {
    if (this.options.scrollParent) {
      const scrollParent =
        typeof this.options.scrollParent === 'function' ? this.options.scrollParent() : this.options.scrollParent

      if (scrollParent) {
        scrollParent.removeEventListener('scroll', this.storage.scrollHandler)
      }
    }
  },

  addProseMirrorPlugins() {
    return [TableOfContentsPlugin({ getId: this.options.getId, anchorTypes: this.options.anchorTypes })]
  },
})

interface TableOfContentsProps {
  onTocUpdate?: (toc: TocList) => void
  tableOfContentsOptions?: TableOfContentsOptions
}

export const TableOfContents = ({ onTocUpdate, tableOfContentsOptions }: TableOfContentsProps) =>
  TableOfContentsExtension.configure({
    getIndex: getHierarchicalIndexes,
    ...(tableOfContentsOptions || {}),
    onUpdate(data: TableOfContentData, isCreate?: boolean) {
      tableOfContentsOptions?.onUpdate?.(data, isCreate)
      setTimeout(() => {
        onTocUpdate?.(data.map((content: { id: any; isActive: any; isScrolledOver: any; itemIndex: any; level: any; originalLevel: any; pos: any; textContent: any }) => ({
          id: content.id,
          isActive: content.isActive,
          isScrolledOver: content.isScrolledOver,
          itemIndex: content.itemIndex,
          level: content.level,
          originalLevel: content.originalLevel,
          pos: content.pos,
          textContent: content.textContent,
        })))
      }, 0)
    }
  })

export default TableOfContents


// import { TocList } from '../../../../types'
// import { getHierarchicalIndexes, TableOfContents, TableOfContentsOptions } from '@tiptap/extension-table-of-contents'
// import { Plugin, PluginKey } from '@tiptap/pm/state'

// interface Props {
//   onTocUpdate?: (toc: TocList) => void
//   tableOfContentsOptions?: TableOfContentsOptions
// }

// export const TableOfContentsExtension = ({ onTocUpdate, tableOfContentsOptions }: Props) => TableOfContents.extend({
//   addProseMirrorPlugins() {
//     const imeCompositionPluginKey = new PluginKey('imeComposition')

//     return [
//       new Plugin({
//         key: new PluginKey('tableOfContentImeFix'),
//         appendTransaction(transactions, _oldState, newState) {
//           if (transactions.some(tr => tr.getMeta('composition'))) {
//             return null
//           }
//           const imePluginState = imeCompositionPluginKey.getState(newState) as { isComposing?: boolean } | null
//           if (imePluginState?.isComposing) {
//             return null
//           }
//           return null
//         },
//       }),
//     ]
//   }
// }).configure({
//   getIndex: getHierarchicalIndexes,
//   ...(tableOfContentsOptions || {}),
//   onUpdate(data, isCreate) {
//     // 先调用用户传入的 onUpdate 回调（如果存在）
//     tableOfContentsOptions?.onUpdate?.(data, isCreate)

//     // 然后调用我们的 onTocUpdate 回调
//     setTimeout(() => {
//       onTocUpdate?.(data.map(content => ({
//         id: content.id,
//         isActive: content.isActive,
//         isScrolledOver: content.isScrolledOver,
//         itemIndex: content.itemIndex,
//         level: content.level,
//         originalLevel: content.originalLevel,
//         pos: content.pos,
//         textContent: content.textContent,
//       })))
//     }, 60)
//   }
// })
