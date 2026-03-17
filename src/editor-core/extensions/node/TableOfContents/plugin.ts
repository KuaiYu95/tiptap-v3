import type { NodeType } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { v4 as uuidv4 } from 'uuid'
import { hasImeCompositionMeta } from '../../extension/ime-shared'

export const TableOfContentsPlugin = ({
  getId,
  anchorTypes = ['heading'],
}: {
  getId?: (textContent: string) => string
  anchorTypes?: Array<string | NodeType>
}) => {
  return new Plugin({
    key: new PluginKey('tableOfContent'),

    appendTransaction(transactions, oldState, newState) {
      // 若处于组合输入，完全避免在此事务中写入 id，交由扩展层异步生成
      if ((newState as any).view?.composing ||
        (typeof document !== 'undefined' && (document as any).composing) ||
        (typeof window !== 'undefined' && (window as any).compositionState)) {
        return null
      }

      // 检查是否有任何事务包含组合相关的变化
      const hasCompositionChanges = transactions.some(hasImeCompositionMeta)

      if (hasCompositionChanges) {
        return null
      }

      const tr = newState.tr
      let modified = false

      if (transactions.some(transaction => transaction.docChanged) && !oldState.doc.eq(newState.doc)) {
        const existingIds: string[] = []

        newState.doc.descendants((node, pos) => {
          const nodeId = node.attrs.id

          if (!anchorTypes.includes(node.type.name) || node.textContent.length === 0) {
            return
          }

          if (nodeId === null || nodeId === undefined || existingIds.includes(nodeId)) {
            let id = ''

            if (getId) {
              id = getId(node.textContent)
            } else {
              id = uuidv4()
            }

            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              id,
            })

            modified = true
          }

          existingIds.push(nodeId)
        })
      }

      return modified ? tr : null
    },
  })
}
