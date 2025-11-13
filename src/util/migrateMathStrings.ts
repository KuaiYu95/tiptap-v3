import type { Editor } from '@tiptap/core'
import type { Transaction } from '@tiptap/pm/state'

/**
 * Regular expression to match LaTeX math strings wrapped in single dollar signs.
 * This should not catch dollar signs which are not part of a math expression,
 * like those used for currency or other purposes.
 * It ensures that the dollar signs are not preceded or followed by digits,
 * allowing for proper identification of inline math expressions.
 *
 * - `$x^2 + y^2 = z^2$` will match
 * - `This is $inline math$ in text.` will match
 * - `This is $100$ dollars.` will not match (as it is not a math expression)
 * - `This is $x^2 + y^2 = z^2$ and $100$ dollars.` will match both math expressions
 * - `$$\frac{a}{b}$$` will NOT match (block math should be handled separately)
 */
export const mathMigrationRegex = /\$(?!\d+\$)(?!\$)(.+?)(?<!\$)\$(?!\d)(?!\$)/g

/**
 * Regular expression to match LaTeX math strings wrapped in double dollar signs.
 * This matches block-level math expressions that should be displayed on their own line.
 *
 * - `$$\frac{a}{b}$$` will match
 * - `$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$` will match
 * - `$$100$$ dollars` will not match (as it is not a math expression)
 */
export const blockMathMigrationRegex = /\$\$([^$]+)\$\$/g

/**
 * Alternative approach: First find all math patterns, then classify them
 * This is more reliable than trying to use complex regex patterns
 */
export const allMathPatternsRegex = /\$\$?[^$]*\$\$?/g

/**
 * Creates a transaction that migrates existing math strings in the document to new math nodes.
 * This function traverses the document and replaces LaTeX math syntax with proper math nodes,
 * preserving the mathematical content. It handles both inline and block math expressions.
 * 
 * Note: Math formulas inside <pre> and <code> tags are ignored to preserve code formatting.
 *
 * @param editor - The editor instance containing the schema and configuration
 * @param tr - The transaction to modify with the migration operations
 * @returns The modified transaction with math string replacements
 *
 * @example
 * ```typescript
 * const editor = new Editor({ ... })
 * const tr = editor.state.tr
 * const updatedTr = createMathMigrateTransaction(editor, tr)
 * editor.view.dispatch(updatedTr)
 * ```
 */
export function createMathMigrateTransaction(editor: Editor, tr: Transaction) {
  const inlineMathNode = editor.schema.nodes.inlineMath
  const blockMathNode = editor.schema.nodes.blockMath

  // 收集所有需要处理的数学公式，按位置排序
  const allMathReplacements: Array<{
    pos: number
    match: string
    type: 'inline' | 'block'
    latex: string
    parent: any
    index: number
  }> = []

  // 第一遍：收集所有数学公式信息
  tr.doc.descendants((node, pos) => {
    // 跳过代码块和预格式化文本
    if (node.marks.some(mark => mark.type.name === 'codeBlock' || mark.type.name === 'code')) {
      return
    }

    if (!node.isText || !node.text || !node.text.includes('$')) {
      return
    }

    const { text } = node

    // 使用更可靠的方法：先找到所有可能的数学模式，然后分类
    const allMatches = text.match(allMathPatternsRegex)
    if (!allMatches) {
      return
    }

    // 按位置排序，从后往前处理，避免位置偏移问题
    const sortedMatches = allMatches
      .map(match => {
        const isBlock = match.startsWith('$$') && match.endsWith('$$')
        const type = isBlock ? 'block' : 'inline'

        return {
          match,
          start: text.indexOf(match),
          end: text.indexOf(match) + match.length,
          type
        }
      })
      .sort((a, b) => b.start - a.start) // 从后往前排序

    sortedMatches.forEach(({ match, start, type }) => {
      const from = tr.mapping.map(pos + start)

      const $from = tr.doc.resolve(from)
      const parent = $from.parent
      const index = $from.index()

      let latex
      if (type === 'block') {
        latex = match.slice(2, -2) // 移除 $$ 符号
      } else {
        latex = match.slice(1, -1) // 移除 $ 符号
      }

      allMathReplacements.push({
        pos: from,
        match,
        type: type as 'inline' | 'block',
        latex,
        parent,
        index
      })
    })
  })

  // 按位置从后往前排序，避免位置偏移问题
  allMathReplacements.sort((a, b) => b.pos - a.pos)

  // 第二遍：执行替换
  allMathReplacements.forEach(({ pos, match, type, latex, parent, index }) => {
    let mathNode

    if (type === 'block') {
      // 块级数学公式
      mathNode = blockMathNode
    } else {
      // 行内数学公式
      mathNode = inlineMathNode
    }

    if (type === 'block') {
      // 对于块级数学公式，需要特殊处理
      // 1. 先删除原始文本
      const endPos = pos + match.length
      tr.delete(pos, endPos)

      // 2. 在删除位置插入块级数学节点
      tr.insert(pos, mathNode.create({ latex }))
    } else {
      // 对于行内数学公式，在段落内部替换
      if (!parent.canReplaceWith(index, index + 1, mathNode)) {
        console.warn(`无法替换行内数学公式:`, match)
        return
      }

      const endPos = pos + match.length
      tr.replaceWith(pos, endPos, mathNode.create({ latex }))
    }
  })

  // don't add to history
  tr.setMeta('addToHistory', false)
  return tr
}

/**
 * Migrates existing math strings in the editor document to math nodes.
 * This function creates and dispatches a transaction that converts LaTeX math syntax
 * into proper math nodes. It handles both inline math (single dollar signs) and
 * block math (double dollar signs). The migration happens immediately and is not
 * added to the editor's history.
 * 
 * Note: Math formulas inside <pre> and <code> tags are ignored to preserve code formatting.
 *
 * @param editor - The editor instance to perform the migration on
 *
 * @example
 * ```typescript
 * const editor = new Editor({
 *   extensions: [Mathematics],
 *   content: 'This is inline math: $x^2 + y^2 = z^2$ and block math: $$\frac{a}{b}$$'
 * })
 *
 * // Math strings will be automatically migrated to math nodes
 * migrateMathStrings(editor)
 * ```
 */
export function migrateMathStrings(editor: Editor) {
  const tr = createMathMigrateTransaction(editor, editor.state.tr)
  editor.view.dispatch(tr)
}