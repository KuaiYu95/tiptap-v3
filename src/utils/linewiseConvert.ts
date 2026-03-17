import { Fragment, Node as PMNode } from '@tiptap/pm/model'
import { Editor } from '@tiptap/react'

export type LinewiseTarget =
  | { type: 'paragraph' }
  | { type: 'heading', level: 1 | 2 | 3 | 4 | 5 | 6 }
  | { type: 'orderedList' }
  | { type: 'bulletList' }
  | { type: 'taskList' }
  | { type: 'blockquote' }
  | { type: 'alert', attrs?: { variant?: string, type?: 'icon' | 'text' } }

/**
 * 提取节点的“行”文本：
 * - paragraph/heading：单行
 * - blockquote：子块逐段（按段）
 * - codeBlock：按换行
 * - alert：按换行
 * - list（ordered/bullet/task）：每个 listItem 作为一行（包含其文本内容）
 * - 其他：作为单行处理
 */
export function extractLinesFromNode(node: PMNode): string[] {
  const type = node.type.name

  // Helper: split textContent by \n and去除首尾空白但保留空行的结构
  const splitByNewline = (text: string) => text.split('\n')

  if (type === 'paragraph' || type === 'heading') {
    return [node.textContent]
  }

  if (type === 'blockquote') {
    const lines: string[] = []
    node.forEach(child => {
      const text = child.textContent
      if (text.includes('\n')) {
        lines.push(...splitByNewline(text))
      } else {
        lines.push(text)
      }
    })
    return lines
  }

  if (type === 'codeBlock') {
    return splitByNewline(node.textContent)
  }

  if (type === 'alert') {
    return splitByNewline(node.textContent)
  }

  if (type === 'orderedList' || type === 'bulletList' || type === 'taskList') {
    const lines: string[] = []
    node.forEach(listItem => {
      const text = listItem.textContent
      if (text.includes('\n')) {
        lines.push(...splitByNewline(text))
      } else {
        lines.push(text)
      }
    })
    return lines
  }

  return [node.textContent]
}

/**
 * 根据目标类型，构造对应的节点或片段。
 */
export function buildNodeFromLines(editor: Editor, lines: string[], target: LinewiseTarget): PMNode | Fragment {
  const { schema } = editor

  const createParagraph = (text: string) => schema.nodes.paragraph.create(undefined, text ? schema.text(text) : undefined)
  const createHeading = (text: string, level: number) => schema.nodes.heading.create({ level }, text ? schema.text(text) : undefined)
  const createListItem = (text: string) => schema.nodes.listItem.create(undefined, createParagraph(text))
  const createTaskItem = (text: string) => schema.nodes.taskItem
    ? schema.nodes.taskItem.create({ checked: false }, createParagraph(text))
    : createListItem(text)

  switch (target.type) {
    case 'paragraph': {
      const nodes = lines.map(l => createParagraph(l))
      return Fragment.fromArray(nodes)
    }
    case 'heading': {
      const nodes = lines.map(l => createHeading(l, target.level))
      return Fragment.fromArray(nodes)
    }
    case 'orderedList': {
      const items = lines.map(l => createListItem(l))
      return schema.nodes.orderedList.create(undefined, Fragment.fromArray(items))
    }
    case 'bulletList': {
      const items = lines.map(l => createListItem(l))
      return schema.nodes.bulletList.create(undefined, Fragment.fromArray(items))
    }
    case 'taskList': {
      const items = lines.map(l => createTaskItem(l))
      if (schema.nodes.taskList) {
        return schema.nodes.taskList.create(undefined, Fragment.fromArray(items))
      }
      return schema.nodes.bulletList.create(undefined, Fragment.fromArray(items))
    }
    case 'blockquote': {
      const paragraphs = lines.map(l => createParagraph(l))
      return schema.nodes.blockquote.create(undefined, Fragment.fromArray(paragraphs))
    }
    case 'alert': {
      const attrs = target.attrs || { variant: 'info', type: 'icon' }
      // 使用 hardBreak 分隔行
      const pieces: PMNode[] = [] as unknown as PMNode[]
      lines.forEach((l, i) => {
        if (l) pieces.push(schema.text(l))
        if (i < lines.length - 1) {
          if (schema.nodes.hardBreak) {
            pieces.push(schema.nodes.hardBreak.create())
          } else {
            // 退化：用文本换行符
            pieces.push(schema.text('\n'))
          }
        }
      })
      const content = pieces.length > 0 ? Fragment.fromArray(pieces) : undefined
      return schema.nodes.alert.create(attrs as any, content as any)
    }
  }
}

/**
 * 通用替换与派发
 */
function replaceRange(editor: Editor, from: number, to: number, content: PMNode | Fragment) {
  const tr = editor.state.tr
  tr.replaceWith(from, to, content as any)
  editor.view.dispatch(tr)
  editor.view.focus()
}

function isContainerNode(node: PMNode): boolean {
  const name = node.type.name
  return name === 'blockquote' || name === 'alert'
}

function isContainerTarget(target: LinewiseTarget): boolean {
  return target.type === 'blockquote' || target.type === 'alert'
}

function createContainerWithContent(editor: Editor, target: LinewiseTarget, content: PMNode | Fragment): PMNode {
  const { schema } = editor
  if (target.type === 'blockquote') {
    return schema.nodes.blockquote.create(undefined, content as any)
  }
  if (target.type === 'alert') {
    const attrs = (target as any).attrs || { variant: 'info', type: 'icon' }
    return schema.nodes.alert.create(attrs as any, content as any)
  }
  throw new Error('createContainerWithContent: invalid container target')
}

/**
 * 将给定位置的节点转换为目标类型（按行规则）。
 */
export function convertNodeAt(editor: Editor, pos: number, node: PMNode, target: LinewiseTarget) {
  const from = pos
  const to = pos + node.nodeSize
  const nodeType = node.type.name

  // 规则 1：目标为容器（blockquote/alert）
  if (isContainerTarget(target)) {
    // 再次点击同容器 -> 拆包
    if ((target.type === 'blockquote' && nodeType === 'blockquote') || (target.type === 'alert' && nodeType === 'alert')) {
      replaceRange(editor, from, to, node.content as any)
      return
    }
    // 容器互转：用内部内容构造目标容器，避免嵌套
    const content = isContainerNode(node) ? node.content : Fragment.from(node)
    const wrapper = createContainerWithContent(editor, target, content)
    replaceRange(editor, from, to, wrapper as any)
    return
  }

  // 规则 2：当前为容器，且目标为非容器 -> 子节点逐个转换
  if (isContainerNode(node)) {
    const nodesToInsert: PMNode[] = [] as unknown as PMNode[]
    node.forEach(child => {
      const built = buildNodeFromLines(editor, extractLinesFromNode(child), target)
      Fragment.from(built as any).forEach(n => { nodesToInsert.push(n as PMNode) })
    })
    replaceRange(editor, from, to, Fragment.fromArray(nodesToInsert) as any)
    return
  }

  // 其他：按行构建单节点替换
  const replacement = buildNodeFromLines(editor, extractLinesFromNode(node), target)
  replaceRange(editor, from, to, replacement as any)
}


