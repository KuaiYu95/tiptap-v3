export * from './fileDownload'
export * from './fileHandler'
export * from './floating'
export * from './linewiseConvert'
export * from './resourceExtractor'
export * from './shortcutKey'

import { Node } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'
import { Editor } from '@tiptap/react'

export const withBaseUrl = (url: string, baseUrl: string): string => {
  const trimmedUrl = url?.trim() ?? ''
  if (!trimmedUrl) return trimmedUrl
  const isAbsolute = /^([a-z][a-z\d+\-.]*:)?\/\//i.test(trimmedUrl) || trimmedUrl.startsWith('data:')
  if (isAbsolute) {
    return trimmedUrl
  }
  const trimmedBase = baseUrl?.trim() ?? ''
  if (!trimmedBase) {
    return trimmedUrl
  }
  if (trimmedUrl.startsWith(trimmedBase)) {
    return trimmedUrl
  }
  const baseEndsWithSlash = trimmedBase.endsWith('/')
  const urlStartsWithSlash = trimmedUrl.startsWith('/')
  if (baseEndsWithSlash && urlStartsWithSlash) {
    return `${trimmedBase.slice(0, -1)}${trimmedUrl}`
  } else if (!baseEndsWithSlash && !urlStartsWithSlash) {
    return `${trimmedBase}/${trimmedUrl}`
  } else {
    return `${trimmedBase}${trimmedUrl}`
  }
}

export const removeBaseUrl = (url: string, baseUrl: string): string => {
  const trimmedUrl = url?.trim() ?? ''
  if (!trimmedUrl) return trimmedUrl

  const trimmedBase = baseUrl?.trim() ?? ''
  if (!trimmedBase) {
    return trimmedUrl
  }

  if (trimmedUrl.startsWith(trimmedBase)) {
    return trimmedUrl.slice(trimmedBase.length)
  }

  return trimmedUrl
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const insertNodeAfterPosition = (editor: Editor, pos: number, nodeContent: any) => {
  editor.chain().focus().insertContentAt(pos, nodeContent).run()
}

export const hasMarksInBlock = (node: Node | null | undefined): boolean => {
  if (!node) return false
  if ((node as any).marks && (node as any).marks.length > 0) return true
  const children = (node as any).content?.content as Node[] | undefined
  if (!children || children.length === 0) return false
  return children.some(child => hasMarksInBlock(child))
}

export const hasMarksInSelection = (state: EditorState) => {
  if (state.selection.empty) {
    return false;
  }
  const { from, to } = state.selection;
  let hasMarks = false;
  state.doc.nodesBetween(from, to, (node) => {
    if (node.marks && node.marks.length > 0) {
      hasMarks = true;
      return false;
    }
  });
  return hasMarks;
}

export function addOpacityToColor(color: string, opacity: number) {
  let red, green, blue;

  if (color.startsWith("#")) {
    red = parseInt(color.slice(1, 3), 16);
    green = parseInt(color.slice(3, 5), 16);
    blue = parseInt(color.slice(5, 7), 16);
  } else if (color.startsWith("rgb")) {
    const matches = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/) as RegExpMatchArray;
    red = parseInt(matches[1], 10);
    green = parseInt(matches[2], 10);
    blue = parseInt(matches[3], 10);
  } else {
    return "";
  }

  const alpha = opacity;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export const getLinkTitle = (href: string) => {
  const paths = href.split('/').filter(it => it.trim().length > 0)
  return paths[paths.length - 1]
}

/**
 * 获取当前选中文本并返回链接属性
 * 如果有选中文本，将文本设置为 title
 * @param editor Tiptap 编辑器实例
 * @returns 包含 title 的链接属性对象（如果有选中文本）
 */
export const getLinkAttributesWithSelectedText = (editor: Editor): { title?: string } => {
  if (!editor) {
    return {}
  }

  const { selection } = editor.state
  const { from, to } = selection

  if (selection.empty || from === to) {
    return {}
  }

  const selectedText = editor.state.doc.textBetween(from, to, '')
  const trimmedText = selectedText.trim()

  if (trimmedText.length > 0) {
    return { title: trimmedText }
  }

  return {}
}

export const extractSrcFromIframe = (input: string): string => {
  const trimmed = input.trim()
  const iframeMatch = trimmed.match(/<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["'][^>]*>/i) ||
    trimmed.match(/<iframe[^>]*\ssrc\s*=\s*([^\s>]+)[^>]*>/i)
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1].trim()
  }
  return trimmed
}

/**
 * 将 B 站链接的 autoplay 统一为 0，避免默认自动播放
 * - autoplay=1 改为 0
 * - autoplay=0 不处理
 * - 无 autoplay 参数则添加 &autoplay=0
 * 支持协议相对地址（//player.bilibili.com/...），会先转为 https: 再解析
 */
export const normalizeBilibiliAutoplay = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  try {
    // 处理协议相对地址（//player.bilibili.com/...）和相对路径
    const urlToParse = trimmed.startsWith('//')
      ? 'https:' + trimmed
      : /^https?:\/\//i.test(trimmed)
        ? trimmed
        : 'https://' + trimmed
    const u = new URL(urlToParse)
    const host = u.hostname.toLowerCase()
    if (!host.includes('bilibili.com') && !host.includes('b23.tv')) {
      return trimmed
    }
    const autoplay = u.searchParams.get('autoplay')
    if (autoplay !== '0') {
      u.searchParams.set('autoplay', '0')
    }
    return u.toString()
  } catch {
    return trimmed
  }
}