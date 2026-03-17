import { Extensions } from '@tiptap/core';
import { generateJSON } from '@tiptap/html';
import DiffMatchPatch from 'diff-match-patch';

// 创建diff-match-patch实例
const dmp = new DiffMatchPatch();

// 类型定义
export interface TextDiff {
  offset: number;
  length: number;
  text: string;
  operation: number;
}

export interface AttrChange {
  key: string;
  oldValue: any;
  newValue: any;
  fromOffset?: number;
  toOffset?: number;
}

export interface DiffItem {
  type: 'insert' | 'delete' | 'modify';
  path: number[];
  node?: any;
  textDiff?: TextDiff;
  attrChange?: AttrChange;
}

export interface DocumentComparison {
  oldDoc: any;
  newDoc: any;
  diffs: DiffItem[];
  hasChanges: boolean;
}

export interface ProseMirrorNode {
  type: string;
  attrs?: Record<string, any>;
  content?: ProseMirrorNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
}

/**
 * 将HTML转换为ProseMirror文档结构
 * @param {string} html - HTML字符串
 * @param {Array} extensions - Tiptap扩展数组
 * @returns {Object} ProseMirror文档对象
 */
export function parseHtmlToDoc(html: string, extensions: Extensions): any {
  return generateJSON(html, extensions);
}

function haveSameMarks(a?: Array<{ type: string; attrs?: Record<string, any> }>, b?: Array<{ type: string; attrs?: Record<string, any> }>): boolean {
  const arrA = a || [];
  const arrB = b || [];
  if (arrA.length !== arrB.length) return false;
  const serialize = (m: { type: string; attrs?: Record<string, any> }) => `${m.type}:${JSON.stringify(m.attrs || {})}`;
  const setA = new Set(arrA.map(serialize));
  for (const m of arrB) {
    if (!setA.has(serialize(m))) return false;
  }
  return true;
}

/**
 * 对比两个ProseMirror文档节点
 * @param {Object} nodeA - 旧文档节点
 * @param {Object} nodeB - 新文档节点
 * @param {Array} path - 当前节点路径
 * @returns {Array} 差异数组
 */
function compareNodes(nodeA: ProseMirrorNode | undefined, nodeB: ProseMirrorNode | undefined, path: number[] = []): DiffItem[] {
  const diffs: DiffItem[] = [];

  // 如果节点类型不同，标记整个节点为变更
  if (nodeA?.type !== nodeB?.type) {
    if (nodeA) {
      diffs.push({
        type: 'delete',
        path: [...path],
        node: nodeA
      });
    }
    if (nodeB) {
      diffs.push({
        type: 'insert',
        path: [...path],
        node: nodeB
      });
    }
    return diffs;
  }

  // 如果是文本节点，进行文本级别的diff
  if (nodeA?.type === 'text' && nodeB?.type === 'text') {
    if (nodeA.text !== nodeB.text) {
      // 计算文本差异
      const textDiffs = dmp.diff_main(nodeA.text || '', nodeB.text || '');
      dmp.diff_cleanupSemantic(textDiffs);

      // 检查是否有文本差异
      // if (textDiffs.length > 1) {
      //   console.log('发现文本差异:', { oldText: nodeA.text, newText: nodeB.text, path });
      // }

      let textOffset = 0; // offset in the NEW text node

      textDiffs.forEach(([operation, text]: [number, string]) => {
        if (operation === -1) { // Delete
          // The widget should be placed at the current position in the new text.
          const diffItem: DiffItem = {
            type: 'delete',
            path: [...path],
            textDiff: {
              offset: textOffset,
              length: text.length,
              text,
              operation
            }
          };
          diffs.push(diffItem);
          // DO NOT advance textOffset
        } else if (operation === 1) { // Insert
          const diffItem: DiffItem = {
            type: 'insert',
            path: [...path],
            textDiff: {
              offset: textOffset,
              length: text.length,
              text,
              operation
            }
          };
          diffs.push(diffItem);
          textOffset += text.length; // DO advance textOffset
        } else { // Equal
          textOffset += text.length; // DO advance textOffset
        }
      });
    }
    // 文本相等或不相等时都可检查 marks 差异（粗粒度：节点级）
    if (!haveSameMarks(nodeA.marks, nodeB.marks)) {
      diffs.push({
        type: 'modify',
        path: [...path],
        attrChange: {
          key: 'marks',
          oldValue: nodeA.marks || [],
          newValue: nodeB.marks || []
        }
      });
    }
    return diffs;
  }

  // 优先：段落/标题等内联容器执行字符级 diff 和 marks 区间对比
  if (nodeA && nodeB && isInlineContainer(nodeA) && isInlineContainer(nodeB)) {
    // 文本与 marks 的字符级 diff
    diffs.push(...compareInlineContainer(nodeA, nodeB, path));
    // 非文本内联节点（如行内数学、行内公式等）的结构化对比
    diffs.push(...compareInlineContainerChildren(nodeA, nodeB, path));
    return diffs;
  }

  // 对比节点属性
  const attrsA = nodeA?.attrs || {};
  const attrsB = nodeB?.attrs || {};
  const allAttrKeys = new Set([...Object.keys(attrsA), ...Object.keys(attrsB)]);

  for (const key of Array.from(allAttrKeys)) {
    if (attrsA[key] !== attrsB[key]) {
      diffs.push({
        type: 'modify',
        path: [...path],
        attrChange: {
          key,
          oldValue: attrsA[key],
          newValue: attrsB[key]
        }
      });
    }
  }

  // 使用 LCS 对齐子节点，减少错配
  const contentA = nodeA?.content || [];
  const contentB = nodeB?.content || [];
  const pairs = lcsAlign(contentA, contentB, nodesEqualForAlign);

  let ai = 0;
  let bi = 0;
  for (const [i, j] of pairs) {
    // 先处理 A 中未匹配（删除），以 B 的当前位置作为锚点
    while (ai < i) {
      const delNode = contentA[ai];
      diffs.push({
        type: 'delete',
        path: [...path, bi],
        node: delNode
      });
      ai++;
    }
    // 再处理 B 中未匹配（插入）
    while (bi < j) {
      const insNode = contentB[bi];
      diffs.push({
        type: 'insert',
        path: [...path, bi],
        node: insNode
      });
      bi++;
    }
    // 匹配上的成对递归，路径以新文档索引为准
    const childA = contentA[i];
    const childB = contentB[j];
    diffs.push(...compareNodes(childA, childB, [...path, j]));
    ai = i + 1;
    bi = j + 1;
  }
  // 处理尾部剩余未匹配项
  while (ai < contentA.length) {
    const delNode = contentA[ai];
    diffs.push({
      type: 'delete',
      path: [...path, bi],
      node: delNode
    });
    ai++;
  }
  while (bi < contentB.length) {
    const insNode = contentB[bi];
    diffs.push({
      type: 'insert',
      path: [...path, bi],
      node: insNode
    });
    bi++;
  }

  return diffs;
}

function isInlineContainer(node: ProseMirrorNode): boolean {
  return node.type === 'paragraph' || node.type === 'heading';
}

function extractInlineTextAndMarks(node: ProseMirrorNode): { text: string; marksMap: Array<Array<{ type: string; attrs?: Record<string, any> }>> } {
  const resultChars: string[] = [];
  const marksMap: Array<Array<{ type: string; attrs?: Record<string, any> }>> = [];
  const content = node.content || [];
  for (const child of content) {
    if (child.type === 'text') {
      const t = child.text || '';
      for (let i = 0; i < t.length; i++) {
        resultChars.push(t[i]);
        marksMap.push((child.marks || []).slice());
      }
    }
  }
  return { text: resultChars.join(''), marksMap };
}

function compareInlineContainer(nodeA: ProseMirrorNode, nodeB: ProseMirrorNode, path: number[]): DiffItem[] {
  const diffs: DiffItem[] = [];
  const { text: oldText, marksMap: oldMarks } = extractInlineTextAndMarks(nodeA);
  const { text: newText, marksMap: newMarks } = extractInlineTextAndMarks(nodeB);

  const blocks = dmp.diff_main(oldText, newText);
  dmp.diff_cleanupSemantic(blocks);

  let oldOffset = 0;
  let newOffset = 0;

  for (const [operation, text] of blocks as Array<[number, string]>) {
    const len = text.length;
    if (operation === -1) {
      // 删除：在新文本当前位置放置删除widget
      diffs.push({
        type: 'delete',
        path: [...path],
        textDiff: { offset: newOffset, length: len, text, operation }
      });
      oldOffset += len;
    } else if (operation === 1) {
      // 插入：直接在新文本当前位置标注
      diffs.push({
        type: 'insert',
        path: [...path],
        textDiff: { offset: newOffset, length: len, text, operation }
      });
      newOffset += len;
    } else {
      // 相等：检测 marks 差异并生成区间级 modify
      let runStart: number | null = null;
      for (let i = 0; i < len; i++) {
        const oldIdx = oldOffset + i;
        const newIdx = newOffset + i;
        const same = haveSameMarks(oldMarks[oldIdx] || [], newMarks[newIdx] || []);
        if (!same) {
          if (runStart === null) runStart = i;
        } else if (runStart !== null) {
          diffs.push({
            type: 'modify',
            path: [...path],
            attrChange: {
              key: 'marks',
              oldValue: oldMarks.slice(oldOffset + runStart, oldOffset + i),
              newValue: newMarks.slice(newOffset + runStart, newOffset + i),
              fromOffset: newOffset + runStart,
              toOffset: newOffset + i
            }
          });
          runStart = null;
        }
      }
      if (runStart !== null) {
        const i = len;
        diffs.push({
          type: 'modify',
          path: [...path],
          attrChange: {
            key: 'marks',
            oldValue: oldMarks.slice(oldOffset + runStart, oldOffset + i),
            newValue: newMarks.slice(newOffset + runStart, newOffset + i),
            fromOffset: newOffset + runStart,
            toOffset: newOffset + i
          }
        });
      }
      oldOffset += len;
      newOffset += len;
    }
  }

  return diffs;
}

function nodesEqualForAlign(a?: ProseMirrorNode, b?: ProseMirrorNode): boolean {
  if (!a || !b) return false;
  if (a.type !== b.type) return false;
  // 对部分结构节点使用关键属性辅助匹配
  if (a.type === 'heading') {
    return (a.attrs?.level ?? null) === (b.attrs?.level ?? null);
  }
  if (a.type === 'codeBlock' || a.type === 'code_block') {
    const langA = a.attrs?.language ?? a.attrs?.lang ?? null;
    const langB = b.attrs?.language ?? b.attrs?.lang ?? null;
    return langA === langB;
  }
  if (a.type === 'table_cell' || a.type === 'tableHeader' || a.type === 'table_header') {
    const colspanA = a.attrs?.colspan ?? 1;
    const colspanB = b.attrs?.colspan ?? 1;
    const rowspanA = a.attrs?.rowspan ?? 1;
    const rowspanB = b.attrs?.rowspan ?? 1;
    return colspanA === colspanB && rowspanA === rowspanB;
  }
  // 默认仅按类型
  return true;
}

function compareInlineContainerChildren(nodeA: ProseMirrorNode, nodeB: ProseMirrorNode, path: number[]): DiffItem[] {
  const diffs: DiffItem[] = [];
  const aList = (nodeA.content || []).map((n, idx) => ({ n, idx })).filter(x => x.n.type !== 'text');
  const bList = (nodeB.content || []).map((n, idx) => ({ n, idx })).filter(x => x.n.type !== 'text');

  const equals = (x?: { n: ProseMirrorNode, idx: number }, y?: { n: ProseMirrorNode, idx: number }) => {
    if (!x || !y) return false;
    // 仅按类型对齐，属性差异作为 modify 处理
    return x.n.type === y.n.type;
  };

  const pairs = lcsAlign(aList, bList, equals);

  let ai = 0, bi = 0;
  for (const [i, j] of pairs) {
    // 删除：使用新文档当前位置作为锚点路径
    while (ai < i) {
      const del = aList[ai];
      const anchorIdx = bi < bList.length ? bList[bi].idx : (nodeB.content ? nodeB.content.length : 0);
      diffs.push({ type: 'delete', path: [...path, anchorIdx], node: del.n });
      ai++;
    }
    // 插入：直接使用新文档该节点的实际索引
    while (bi < j) {
      const ins = bList[bi];
      diffs.push({ type: 'insert', path: [...path, ins.idx], node: ins.n });
      bi++;
    }
    // modify：同类型节点进行属性对比，路径指向新文档该内联节点索引
    const aItem = aList[i];
    const bItem = bList[j];
    if (aItem && bItem) {
      const oldAttrs = aItem.n.attrs || {};
      const newAttrs = bItem.n.attrs || {};
      if (JSON.stringify(oldAttrs) !== JSON.stringify(newAttrs)) {
        diffs.push({
          type: 'modify',
          path: [...path, bItem.idx],
          attrChange: { key: 'attrs', oldValue: oldAttrs, newValue: newAttrs }
        });
      }
    }
    ai = i + 1; bi = j + 1;
  }

  // 尾部删除
  while (ai < aList.length) {
    const del = aList[ai++];
    const anchorIdx = bi < bList.length ? bList[bi].idx : (nodeB.content ? nodeB.content.length : 0);
    diffs.push({ type: 'delete', path: [...path, anchorIdx], node: del.n });
  }
  // 尾部插入
  while (bi < bList.length) {
    const ins = bList[bi++];
    diffs.push({ type: 'insert', path: [...path, ins.idx], node: ins.n });
  }
  return diffs;
}

function lcsAlign<T>(a: T[], b: T[], equals: (x: T, y: T) => boolean): Array<[number, number]> {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = equals(a[i], b[j]) ? 1 + dp[i + 1][j + 1] : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const pairs: Array<[number, number]> = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (equals(a[i], b[j])) {
      pairs.push([i, j]);
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return pairs;
}

/**
 * 对比两个HTML文档并生成结构化差异
 * @param {string} oldHtml - 旧HTML
 * @param {string} newHtml - 新HTML
 * @param {Array} extensions - Tiptap扩展数组
 * @returns {Object} 包含差异信息的对象
 */
export function compareDocuments(oldHtml: string, newHtml: string, extensions: Extensions): DocumentComparison {
  const docA = parseHtmlToDoc(oldHtml, extensions);
  const docB = parseHtmlToDoc(newHtml, extensions);

  const diffs = compareNodes(docA, docB);

  return {
    oldDoc: docA,
    newDoc: docB,
    diffs,
    hasChanges: diffs.length > 0
  };
}

/**
 * 将路径转换为ProseMirror位置
 * @param {Array} path - 节点路径
 * @param {Object} doc - ProseMirror文档
 * @returns {number} 文档位置
 */
export function pathToPos(path: number[], doc: any): number {
  let pos = 0;
  let current = doc as any;

  for (let i = 0; i < path.length; i++) {
    const index = path[i];

    const contentStartOffset = current.type.name === 'doc' ? 0 : 1;
    let resolvedPos = pos + contentStartOffset;

    const childCount = current.childCount ?? 0;
    const effectiveIndex = Math.min(index, childCount);

    for (let j = 0; j < effectiveIndex; j++) {
      const child = current.child(j);
      resolvedPos += child.nodeSize;
    }

    pos = resolvedPos;

    if (index < childCount) {
      current = current.child(index);
    } else {
      // Path points past the end in this doc (likely a deletion). Stop descending
      break;
    }
  }
  return pos;
}