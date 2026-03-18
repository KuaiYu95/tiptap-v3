/* eslint-disable @typescript-eslint/no-use-before-define */
import { Node as PMNode } from '@tiptap/pm/model';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { pathToPos } from './structuredDiff';
import type { DiffItem, ProseMirrorNode, StructuredDiffOptions } from './structuredDiff';

/**
 * 创建插入内容的装饰
 * @param {number} from - 开始位置
 * @param {number} to - 结束位置
 * @returns {Decoration} 装饰对象
 */
function createInsertDecoration(from: number, to: number): Decoration {
  return Decoration.inline(from, to, {
    class: 'diff-insert-highlight',
    style: 'background-color: #d4edda; color: #28a745; padding: 2px 4px; border-radius: 3px; margin: 0 1px; border: 1px dashed #28a745;'
  });
}

/**
 * 创建修改内容的装饰
 * @param {number} from - 开始位置
 * @param {number} to - 结束位置
 * @returns {Decoration} 装饰对象
 */
function createModifyDecoration(from: number, to: number): Decoration {
  return Decoration.inline(from, to, {
    class: 'diff-modify-highlight',
    style: 'background-color: #fff3cd; color: #856404; padding: 2px 4px; border-radius: 3px; margin: 0 1px; border: 1px dashed #856404;'
  });
}

/**
 * 创建删除内容的widget装饰
 * @param {number} pos - 插入位置
 * @param {Object} deletedNode - 被删除的节点
 * @returns {Decoration} widget装饰对象
 */
function createDeleteWidget(
  pos: number,
  deletedNode: ProseMirrorNode,
  options?: StructuredDiffOptions
): Decoration {
  const widget = document.createElement('span');
  widget.className = 'diff-delete-widget';
  widget.style.cssText = `
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    text-decoration: line-through;
    padding: 2px 4px;
    border-radius: 3px;
    margin: 0 1px;
    border: 1px dashed #dc3545;
    font-style: italic;
  `;

  // 提取删除内容的文本
  const deletedText = getDeletedNodePreviewText(deletedNode, options);
  widget.textContent = deletedText || '[已删除]';

  // 添加工具提示
  widget.title = `删除的内容: ${deletedText}`;

  return Decoration.widget(pos, widget, {
    side: 1
  });
}

function normalizePreviewText(value: unknown): string {
  if (typeof value === 'string') {
    return value.replace(/\s+/g, ' ').trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return '';
}

function truncatePreviewText(text: string, maxLength: number = 60): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}...`;
}

function getFileNameFromUrl(url: string): string {
  const normalizedUrl = normalizePreviewText(url);

  if (!normalizedUrl) {
    return '';
  }

  try {
    const parsedUrl = new URL(normalizedUrl, 'https://placeholder.local');
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    return decodeURIComponent(segments[segments.length - 1] || '');
  } catch {
    const segments = normalizedUrl.split('/').filter(Boolean);
    return segments[segments.length - 1] || normalizedUrl;
  }
}

function formatDeletedNodeLabel(typeLabel: string, detail?: string): string {
  const normalizedDetail = normalizePreviewText(detail);

  if (!normalizedDetail) {
    return `[已删除${typeLabel}]`;
  }

  return `[已删除${typeLabel}: ${truncatePreviewText(normalizedDetail)}]`;
}

/**
 * 从节点中提取文本内容
 * @param {Object} node - ProseMirror节点
 * @returns {string} 提取的文本
 */
function extractTextFromNode(node: ProseMirrorNode): string {
  if (!node) return '';

  if (node.type === 'text') {
    return node.text || '';
  }

  if (node.content && Array.isArray(node.content)) {
    return node.content.map(child => extractTextFromNode(child)).join('');
  }

  return '';
}

export function getDeletedNodePreviewText(node: ProseMirrorNode, options?: StructuredDiffOptions): string {
  if (!node) {
    return '';
  }

  const customPreview = normalizePreviewText(options?.nodePreviewSerializer?.(node));

  if (customPreview) {
    return truncatePreviewText(customPreview);
  }

  const textContent = truncatePreviewText(normalizePreviewText(extractTextFromNode(node)));

  if (textContent) {
    return textContent;
  }

  const attrs = node.attrs || {};
  const nodeType = node.type || 'content';
  const namedDetail = (value?: unknown, fallback?: unknown) => {
    const detail = normalizePreviewText(value) || normalizePreviewText(fallback);
    return detail || '';
  };

  switch (nodeType) {
    case 'image':
      return formatDeletedNodeLabel('图片', namedDetail(attrs.alt, attrs.src && getFileNameFromUrl(attrs.src)));
    case 'inlineAttachment':
    case 'blockAttachment':
      return formatDeletedNodeLabel('附件', namedDetail(attrs.title, attrs.url && getFileNameFromUrl(attrs.url)));
    case 'video':
      return formatDeletedNodeLabel('视频', namedDetail(attrs.title, attrs.src && getFileNameFromUrl(attrs.src)));
    case 'audio':
      return formatDeletedNodeLabel('音频', namedDetail(attrs.title, attrs.src && getFileNameFromUrl(attrs.src)));
    case 'iframe':
      return formatDeletedNodeLabel('嵌入内容', namedDetail(attrs.title, attrs.src));
    case 'inlineMath':
      return formatDeletedNodeLabel('行内公式', attrs.latex);
    case 'blockMath':
      return formatDeletedNodeLabel('公式', attrs.latex);
    case 'inlineLink':
    case 'blockLink':
      return formatDeletedNodeLabel('链接', namedDetail(attrs.title, attrs.href));
    case 'details':
      return formatDeletedNodeLabel('折叠块');
    case 'detailsSummary':
      return formatDeletedNodeLabel('折叠标题');
    case 'detailsContent':
      return formatDeletedNodeLabel('折叠内容');
    case 'table':
      return formatDeletedNodeLabel('表格');
    case 'codeBlock':
    case 'code_block':
      return formatDeletedNodeLabel('代码块', attrs.language || attrs.lang);
    default:
      return formatDeletedNodeLabel('内容');
  }
}

/**
 * 根据差异数组创建装饰集合
 * @param {Array} diffs - 差异数组
 * @param {Object} doc - ProseMirror文档
 * @returns {DecorationSet} 装饰集合
 */
export function createDecorationsFromDiffs(
  diffs: DiffItem[],
  doc: PMNode,
  options?: StructuredDiffOptions
): DecorationSet {
  const decorations: Decoration[] = [];

  diffs.forEach(diff => {
    try {
      const pos = pathToPos(diff.path, doc as any);
      const pmNodeAtPath = getPMNodeAtPath(diff.path, doc);

      switch (diff.type) {
        case 'insert':
          if (diff.textDiff) {
            // 文本级别的插入
            const base = adjustBaseForInline(pmNodeAtPath, pos);
            const from = base + mapInlineOffsetToPM(pmNodeAtPath, diff.textDiff.offset);
            const to = base + mapInlineOffsetToPM(pmNodeAtPath, diff.textDiff.offset + diff.textDiff.length);
            decorations.push(createInsertDecoration(from, to));
          } else if (diff.node) {
            // 节点级别的插入
            if (pmNodeAtPath) {
              if ((pmNodeAtPath as any).isText && ((pmNodeAtPath as any).text?.length || 0) > 0) {
                const from = pos;
                const to = pos + (((pmNodeAtPath as any).text?.length) || 0);
                decorations.push(createInsertDecoration(from, to));
              } else {
                const from = pos;
                const to = pos + (pmNodeAtPath as any).nodeSize;
                decorations.push(Decoration.node(from, to, {
                  class: 'diff-insert-highlight',
                  style: 'background-color: rgba(40,167,69,0.12); border-radius: 3px; border: 1px dashed #28a745;'
                }));
              }
            } else {
              // 回退到基于 JSON 节点的估算
              const nodeSize = getNodeSize(diff.node);
              const from = pos + 1;
              const to = pos + nodeSize - 1;
              if (to > from) {
                decorations.push(createInsertDecoration(from, to));
              }
            }
          }
          break;

        case 'delete':
          if (diff.textDiff) {
            // 文本级别的删除 - 使用widget显示
            const base = adjustBaseForInline(pmNodeAtPath, pos);
            const widgetPos = base + mapInlineOffsetToPM(pmNodeAtPath, diff.textDiff.offset);
            decorations.push(createDeleteWidget(widgetPos, {
              type: 'text',
              text: diff.textDiff.text
            }, options));
          } else if (diff.node) {
            // 节点级别的删除 - 使用widget显示
            decorations.push(createDeleteWidget(pos, diff.node, options));
          }
          break;

        case 'modify':
          if (diff.attrChange) {
            // 基于 marks 的区间高亮
            if (diff.attrChange.key === 'marks' && typeof diff.attrChange.fromOffset === 'number' && typeof diff.attrChange.toOffset === 'number') {
              const base = adjustBaseForInline(pmNodeAtPath, pos);
              const from = base + mapInlineOffsetToPM(pmNodeAtPath, diff.attrChange.fromOffset);
              const to = base + mapInlineOffsetToPM(pmNodeAtPath, diff.attrChange.toOffset);
              if (to > from) {
                decorations.push(createModifyDecoration(from, to));
              }
            } else if (diff.attrChange.key === 'marks' && pmNodeAtPath && (pmNodeAtPath as any).isText) {
              const textLength = (pmNodeAtPath as any).text ? (pmNodeAtPath as any).text.length : 0;
              if (textLength > 0) {
                const base = adjustBaseForInline(pmNodeAtPath, pos);
                decorations.push(createModifyDecoration(base, base + textLength));
              }
            } else {
              // 其他属性修改 - 节点级高亮
              const nodeName = (pmNodeAtPath as any)?.type?.name || '';
              const isDetailsFamily = nodeName === 'details' || nodeName === 'detailsSummary' || nodeName === 'detailsContent';
              if (!isDetailsFamily) {
                const nodeSize = getPMNodeSizeAtPath(diff.path, doc);
                const from = pos;
                const to = pos + nodeSize;
                decorations.push(Decoration.node(from, to, {
                  class: 'diff-modify-highlight',
                  style: 'background-color: rgba(255,193,7,0.12); border-radius: 3px; border: 1px dashed #856404;'
                }));
              }
            }
          }
          break;
      }
    } catch (error) {
      console.warn('创建装饰时出错:', error, diff);
    }
  });
  return DecorationSet.create(doc, decorations);
}

function getPMNodeAtPath(path: number[], doc: PMNode): PMNode | null {
  let current: PMNode | null = doc;
  for (const index of path) {
    if (!current) return null;
    const childCount = (current as any).childCount ?? 0;
    if (index >= childCount) return null;
    current = (current as any).child(index) as PMNode;
  }
  return current;
}

function getPMNodeSizeAtPath(path: number[], doc: PMNode): number {
  const node = getPMNodeAtPath(path, doc);
  return node ? (node as any).nodeSize : 1;
}

// 对内联文本容器（paragraph/heading）的字符偏移，基于容器内容起点（跳过开标签）
function adjustBaseForInline(pmNodeAtPath: PMNode | null, absolutePos: number): number {
  if (!pmNodeAtPath) return absolutePos;
  // 如果路径对应的是容器本身（非文本子节点），字符偏移应从内容起点计算
  // 但此处无法直接判断路径是否止于容器。我们采用经验：
  // - 若 pmNodeAtPath 不是 text，则偏移从 absolutePos + 1 开始（跳过开标签）
  // - 若是 text，则 absolutePos 已指向文本起点
  if ((pmNodeAtPath as any).isText) return absolutePos;
  return absolutePos + 1;
}

// 将“内联字符偏移”映射到 PM 位置（计入文本节点间的边界）
function mapInlineOffsetToPM(pmNodeAtPath: PMNode | null, inlineOffset: number): number {
  if (!pmNodeAtPath) return inlineOffset;
  // 如果当前就是文本节点，offset 等同
  if ((pmNodeAtPath as any).isText) return inlineOffset;
  // 若是段落/标题容器，则 inlineOffset 是按合并后的字符序列统计，需要遍历其子 text 节点求对应 PM 偏移
  let remaining = inlineOffset;
  let acc = 0;
  const childCount = (pmNodeAtPath as any).childCount ?? 0;
  for (let i = 0; i < childCount; i++) {
    const child = (pmNodeAtPath as any).child(i);
    const size = child.isText ? (child.text?.length || 0) : child.nodeSize; // 非文本节点视作整体
    if (child.isText) {
      if (remaining <= size) {
        acc += remaining;
        return acc;
      }
      acc += size;
      remaining -= size;
    } else {
      // 跳过非文本节点的整体大小
      acc += size;
    }
  }
  // 超出则落在末尾
  return acc;
}

/**
 * 创建空的装饰集合
 * @param {Object} doc - ProseMirror文档
 * @returns {DecorationSet} 空装饰集合
 */
export function createEmptyDecorationSet(doc: PMNode): DecorationSet {
  return DecorationSet.create(doc, []);
}


/**
 * 获取节点大小（包含子节点）
 * @param {Object} node - ProseMirror节点
 * @returns {number} 节点大小
 */
export function getNodeSize(node: ProseMirrorNode): number {
  if (node.type === 'text') {
    return node.text ? node.text.length : 0;
  }

  let size = 2; // 开始和结束标记
  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      size += getNodeSize(child);
    }
  }

  return size;
}
