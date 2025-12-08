
import { TocList } from '@ctzhian/tiptap/type'
import { getHierarchicalIndexes, TableOfContents, TableOfContentsOptions } from '@tiptap/extension-table-of-contents'
import { Plugin, PluginKey } from '@tiptap/pm/state'

interface Props {
  onTocUpdate?: (toc: TocList) => void
  tableOfContentsOptions?: TableOfContentsOptions
}

export const TableOfContentsExtension = ({ onTocUpdate, tableOfContentsOptions }: Props) => TableOfContents.extend({
  addProseMirrorPlugins() {
    const imeCompositionPluginKey = new PluginKey('imeComposition')

    return [
      new Plugin({
        key: new PluginKey('tableOfContentImeFix'),
        appendTransaction(transactions, _oldState, newState) {
          if (transactions.some(tr => tr.getMeta('composition'))) {
            return null
          }
          const imePluginState = imeCompositionPluginKey.getState(newState) as { isComposing?: boolean } | null
          if (imePluginState?.isComposing) {
            return null
          }
          return null
        },
      }),
    ]
  }
}).configure({
  getIndex: getHierarchicalIndexes,
  ...(tableOfContentsOptions || {}),
  onUpdate(data, isCreate) {
    tableOfContentsOptions?.onUpdate?.(data, isCreate)
    setTimeout(() => {
      onTocUpdate?.(data.map(content => ({
        id: content.id,
        isActive: content.isActive,
        isScrolledOver: content.isScrolledOver,
        itemIndex: content.itemIndex,
        level: content.level,
        originalLevel: content.originalLevel,
        pos: content.pos,
        textContent: content.textContent,
      })))
    }, 60)
  }
})
