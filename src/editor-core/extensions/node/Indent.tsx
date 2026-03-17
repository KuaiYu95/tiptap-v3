import { Extension } from '@tiptap/core'

export interface IndentOptions {
  types: string[]
  maxLevel: number
  indentPx: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      setIndent: (level: number) => ReturnType
      increaseIndent: () => ReturnType
      decreaseIndent: () => ReturnType
    }
  }
}

export const Indent = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      // 若为 [], 则对所有节点类型生效
      types: [] as string[],
      maxLevel: 8,
      indentPx: 24,
    }
  },

  addGlobalAttributes() {
    const descriptor: any = {
      attributes: {
        indent: {
          default: 0,
          parseHTML: (element: HTMLElement) => {
            const data = element.getAttribute('data-indent')
            if (data) return parseInt(data, 10) || 0
            const style = element.style.marginLeft
            if (!style) return 0
            const match = style.match(/(\d+)(px|em|rem)/)
            if (!match) return 0
            const val = parseInt(match[1], 10)
            return isNaN(val) ? 0 : Math.round(val / this.options.indentPx)
          },
          renderHTML: (attributes: Record<string, any>) => {
            const level = Number(attributes.indent) || 0
            if (!level) return {}
            const px = level * this.options.indentPx
            return {
              'data-indent': String(level),
              style: `margin-left: ${px}px;`,
            }
          },
        },
      },
    }
    const editorInstance = (this as any).editor
    const typesList = (this.options.types && this.options.types.length > 0)
      ? this.options.types
      : Object.keys(editorInstance?.schema?.nodes || {})
    descriptor.types = typesList
    return [descriptor]
  },

  addCommands() {
    return {
      setIndent: level => ({ commands, editor }) => {
        const { selection } = editor.state as any
        const nodeTypeName = selection?.node?.type?.name || selection?.$from?.parent?.type?.name
        if (!nodeTypeName) return false
        const next = Math.max(0, Math.min(level, this.options.maxLevel))
        return commands.updateAttributes(nodeTypeName, { indent: next })
      },
      increaseIndent: () => ({ commands, editor }) => {
        const { selection } = editor.state as any
        const nodeTypeName = selection?.node?.type?.name || selection?.$from?.parent?.type?.name
        if (!nodeTypeName) return false
        const attrs = editor.getAttributes(nodeTypeName) as Record<string, any>
        const current = Number(attrs.indent) || 0
        const next = Math.max(0, Math.min(current + 1, this.options.maxLevel))
        if (next === current) return false
        return commands.updateAttributes(nodeTypeName, { indent: next })
      },
      decreaseIndent: () => ({ commands, editor }) => {
        const { selection } = editor.state as any
        const nodeTypeName = selection?.node?.type?.name || selection?.$from?.parent?.type?.name
        if (!nodeTypeName) return false
        const attrs = editor.getAttributes(nodeTypeName) as Record<string, any>
        const current = Number(attrs.indent) || 0
        const next = Math.max(0, Math.min(current - 1, this.options.maxLevel))
        if (next === current) return false
        return commands.updateAttributes(nodeTypeName, { indent: next })
      },
    }
  },
})

export default Indent


