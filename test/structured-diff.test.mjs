import assert from 'node:assert/strict'
import test from 'node:test'
import Image from '@tiptap/extension-image'
import StarterKit from '@tiptap/starter-kit'
import { Mark, Node, createNodeFromContent, getSchema } from '@tiptap/core'
import { StructuredDiffExtension } from '../dist/extension/extension/StructuredDiff.js'
import { getDeletedNodePreviewText } from '../dist/util/decorations.js'
import { compareDocuments, parseHtmlToDoc } from '../dist/util/structuredDiff.js'

function createTransaction() {
  return {
    meta: null,
    setMeta(key, value) {
      this.meta = { key, value }
      return this
    },
  }
}

const InlineLeafExtension = Node.create({
  name: 'inlineLeaf',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'div[data-inline-leaf]' }]
  },
  renderHTML() {
    return ['div', { 'data-inline-leaf': '' }, 0]
  },
})

const ToneMark = Mark.create({
  name: 'tone',
  addAttributes() {
    return {
      tone: {
        default: null,
        parseHTML: element => element.getAttribute('data-tone'),
        renderHTML: attributes => attributes.tone
          ? { 'data-tone': attributes.tone }
          : {},
      },
    }
  },
  parseHTML() {
    return [{ tag: 'span[data-tone]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },
})

function createReadonlyExtensions() {
  const DetailsSummaryExtension = Node.create({
    name: 'detailsSummary',
    content: 'inline*',
    parseHTML() {
      return [{ tag: 'summary' }]
    },
    renderHTML() {
      return ['summary', 0]
    },
  })

  const DetailsContentExtension = Node.create({
    name: 'detailsContent',
    group: 'block',
    content: 'block*',
    parseHTML() {
      return [{ tag: 'div[data-type="detailsContent"]' }]
    },
    renderHTML() {
      return ['div', { 'data-type': 'detailsContent' }, 0]
    },
  })

  const DetailsExtension = Node.create({
    name: 'details',
    group: 'block',
    content: 'detailsSummary detailsContent',
    parseHTML() {
      return [{ tag: 'details' }]
    },
    renderHTML() {
      return ['details', 0]
    },
  })

  const InlineMathExtension = Node.create({
    name: 'inlineMath',
    group: 'inline',
    inline: true,
    atom: true,
    addAttributes() {
      return {
        latex: {
          default: '',
          parseHTML: element => element.getAttribute('data-latex') || '',
          renderHTML: attributes => ({ 'data-latex': attributes.latex }),
        },
      }
    },
    parseHTML() {
      return [{ tag: 'span[data-type="inline-math"]' }]
    },
    renderHTML({ HTMLAttributes }) {
      return ['span', { ...HTMLAttributes, 'data-type': 'inline-math' }]
    },
  })

  const BlockMathExtension = Node.create({
    name: 'blockMath',
    group: 'block',
    atom: true,
    addAttributes() {
      return {
        latex: {
          default: '',
          parseHTML: element => element.getAttribute('data-latex') || '',
          renderHTML: attributes => ({ 'data-latex': attributes.latex }),
        },
      }
    },
    parseHTML() {
      return [{ tag: 'div[data-type="block-math"]' }]
    },
    renderHTML({ HTMLAttributes }) {
      return ['div', { ...HTMLAttributes, 'data-type': 'block-math' }]
    },
  })

  return [
    StarterKit,
    Image,
    DetailsExtension,
    DetailsSummaryExtension,
    DetailsContentExtension,
    InlineMathExtension,
    BlockMathExtension,
  ]
}

function summarizeDiffTypes(diffs) {
  return diffs.reduce((summary, diff) => {
    summary[diff.type] = (summary[diff.type] || 0) + 1
    return summary
  }, { insert: 0, delete: 0, modify: 0 })
}

function createEditorStateFromHtml(html, extensions) {
  const schema = getSchema(extensions)
  const json = parseHtmlToDoc(html, extensions)

  return {
    doc: createNodeFromContent(json, schema)
  }
}

test('compareDocuments returns no changes for identical html', () => {
  const result = compareDocuments('<p>same</p>', '<p>same</p>', [StarterKit])

  assert.equal(result.hasChanges, false)
  assert.equal(result.diffs.length, 0)
})

test('compareDocuments returns text diffs for changed html', () => {
  const result = compareDocuments('<p>old value</p>', '<p>new value</p>', [StarterKit])

  assert.equal(result.hasChanges, true)
  assert.ok(result.diffs.length > 0)
  assert.ok(result.diffs.some(diff => diff.type === 'insert' || diff.type === 'delete'))
})

test('compareDocuments can ignore configured attrs without changing the default behavior', () => {
  const defaultResult = compareDocuments('<h1>same title</h1>', '<h2>same title</h2>', [StarterKit])
  const ignoredResult = compareDocuments(
    '<h1>same title</h1>',
    '<h2>same title</h2>',
    [StarterKit],
    { ignoreAttrs: ['level'] }
  )

  assert.equal(defaultResult.hasChanges, true)
  assert.equal(ignoredResult.hasChanges, false)
  assert.equal(ignoredResult.diffs.length, 0)
})

test('compareDocuments can ignore mark attrs without changing the default behavior', () => {
  const oldHtml = '<p><span data-tone="warm">same tone</span></p>'
  const newHtml = '<p><span data-tone="cool">same tone</span></p>'
  const extensions = [StarterKit, ToneMark]
  const defaultResult = compareDocuments(oldHtml, newHtml, extensions)
  const ignoredResult = compareDocuments(oldHtml, newHtml, extensions, {
    ignoreAttrs: ['tone']
  })

  assert.equal(defaultResult.hasChanges, true)
  assert.ok(defaultResult.diffs.some(diff => diff.type === 'modify'))
  assert.equal(ignoredResult.hasChanges, false)
  assert.equal(ignoredResult.diffs.length, 0)
})

test('enhanced engine improves diffs for non-paragraph inline leaf blocks without changing legacy defaults', () => {
  const oldHtml = '<div data-inline-leaf>a<strong>b</strong>c</div>'
  const newHtml = '<div data-inline-leaf>ab<strong>c</strong></div>'
  const extensions = [StarterKit, InlineLeafExtension]

  const legacyResult = compareDocuments(oldHtml, newHtml, extensions)
  const enhancedResult = compareDocuments(oldHtml, newHtml, extensions, {
    engine: 'enhanced'
  })

  assert.ok(legacyResult.diffs.length > enhancedResult.diffs.length)
  assert.equal(enhancedResult.diffs.length, 1)
  assert.equal(enhancedResult.diffs[0].type, 'modify')
  assert.equal(enhancedResult.diffs[0].attrChange?.key, 'marks')
})

test('enhanced engine reduces noisy sibling mismatches for reordered blocks', () => {
  const oldHtml = '<p>A</p><p>B</p>'
  const newHtml = '<p>B</p><p>A</p>'
  const legacyResult = compareDocuments(oldHtml, newHtml, [StarterKit])
  const enhancedResult = compareDocuments(oldHtml, newHtml, [StarterKit], {
    engine: 'enhanced'
  })

  assert.equal(legacyResult.diffs.length, 4)
  assert.equal(enhancedResult.diffs.length, 2)
  assert.ok(enhancedResult.diffs.every(diff => diff.type === 'insert' || diff.type === 'delete'))
  assert.ok(enhancedResult.diffs.every(diff => diff.node))
})

test('rich readonly fixtures stay stable across legacy and enhanced engines', () => {
  const extensions = createReadonlyExtensions()
  const oldHtml = `
    <details class="cq-details" open="">
      <summary>旧标题</summary>
      <div data-type="detailsContent">
        <p>Alpha <strong>beta</strong> <span data-latex="x + y = 1" data-type="inline-math"></span></p>
        <div class="tableWrapper">
          <table style="min-width: 240px;">
            <tbody>
              <tr class="table-row">
                <td colspan="1" rowspan="1"><p>1</p></td>
                <td colspan="1" rowspan="1"><p>2</p></td>
              </tr>
            </tbody>
          </table>
        </div>
        <ol class="ordered-list" data-type="orderedList">
          <li><p>第一项</p></li>
        </ol>
        <blockquote><p>引用段落</p></blockquote>
      </div>
    </details>
    <p><img src="https://cdn.example.com/assets/hero.png" width="200"></p>
    <div data-latex="x + y + z = 1" data-type="block-math"></div>
  `
  const newHtml = `
    <details class="cq-details" open="">
      <summary>新标题</summary>
      <div data-type="detailsContent">
        <p>Alpha beta <span data-latex="x ^ 2 + y ^ 2 = 1" data-type="inline-math"></span></p>
        <div class="tableWrapper">
          <table style="min-width: 240px;">
            <tbody>
              <tr class="table-row">
                <td colspan="1" rowspan="1"><p>1</p></td>
                <td colspan="1" rowspan="1"><p>3</p></td>
              </tr>
            </tbody>
          </table>
        </div>
        <ol class="ordered-list" data-type="orderedList">
          <li><p>第一项已更新</p></li>
          <li><p>第二项</p></li>
        </ol>
        <blockquote><p>引用<strong>更新</strong>段落</p></blockquote>
      </div>
    </details>
    <p><img src="https://cdn.example.com/assets/hero.png" width="420"></p>
    <div data-latex="x ^ 2 + y ^ 2 + z ^ 2 = 1" data-type="block-math"></div>
  `

  const legacyResult = compareDocuments(oldHtml, newHtml, extensions)
  const enhancedResult = compareDocuments(oldHtml, newHtml, extensions, {
    engine: 'enhanced'
  })

  assert.equal(legacyResult.hasChanges, true)
  assert.equal(enhancedResult.hasChanges, true)
  assert.deepEqual(summarizeDiffTypes(legacyResult.diffs), {
    insert: 5,
    delete: 2,
    modify: 4,
  })
  assert.deepEqual(summarizeDiffTypes(enhancedResult.diffs), {
    insert: 5,
    delete: 2,
    modify: 4,
  })
})

test('getDeletedNodePreviewText adds typed fallbacks for non-text nodes', () => {
  assert.equal(
    getDeletedNodePreviewText({
      type: 'image',
      attrs: { src: 'https://cdn.example.com/assets/hero-banner.png' }
    }),
    '[已删除图片: hero-banner.png]'
  )

  assert.equal(
    getDeletedNodePreviewText({
      type: 'blockAttachment',
      attrs: { title: 'design-spec.pdf' }
    }),
    '[已删除附件: design-spec.pdf]'
  )

  assert.equal(
    getDeletedNodePreviewText({
      type: 'blockMath',
      attrs: { latex: 'x^2 + y^2 = 1' }
    }),
    '[已删除公式: x^2 + y^2 = 1]'
  )

  assert.equal(
    getDeletedNodePreviewText(
      {
        type: 'image',
        attrs: { src: 'https://cdn.example.com/assets/hero-banner.png' }
      },
      {
        nodePreviewSerializer: () => '自定义删除预览'
      }
    ),
    '自定义删除预览'
  )
})

test('showStructuredDiff dispatches hideDiff when html is identical', () => {
  const commands = StructuredDiffExtension.config.addCommands.call(StructuredDiffExtension)
  const showStructuredDiff = commands.showStructuredDiff('<p>same</p>', '<p>same</p>')
  const tr = createTransaction()
  let dispatchedTransaction = null
  const extensions = [StarterKit]

  const result = showStructuredDiff({
    tr,
    state: createEditorStateFromHtml('<p>same</p>', extensions),
    dispatch: nextTr => {
      dispatchedTransaction = nextTr
    },
    editor: {
      extensionManager: {
        extensions,
      },
    },
  })

  assert.equal(result, false)
  assert.equal(dispatchedTransaction, tr)
  assert.deepEqual(dispatchedTransaction.meta.value, {
    type: 'hideDiff'
  })
})

test('configured ignoreAttrs stays opt-in on StructuredDiffExtension', () => {
  const configuredExtension = StructuredDiffExtension.configure({
    ignoreAttrs: ['level']
  })
  const commands = configuredExtension.config.addCommands.call(configuredExtension)
  const showStructuredDiff = commands.showStructuredDiff('<h1>same title</h1>', '<h2>same title</h2>')
  const tr = createTransaction()
  let dispatchedTransaction = null
  const extensions = [StarterKit]

  const result = showStructuredDiff({
    tr,
    state: createEditorStateFromHtml('<h2>same title</h2>', extensions),
    dispatch: nextTr => {
      dispatchedTransaction = nextTr
    },
    editor: {
      extensionManager: {
        extensions,
      },
    },
  })

  assert.equal(result, false)
  assert.equal(dispatchedTransaction, tr)
  assert.deepEqual(dispatchedTransaction.meta.value, {
    type: 'hideDiff'
  })
})

test('configured enhanced engine stays opt-in on StructuredDiffExtension', () => {
  const configuredExtension = StructuredDiffExtension.configure({
    engine: 'enhanced'
  })
  const commands = configuredExtension.config.addCommands.call(configuredExtension)
  const showStructuredDiff = commands.showStructuredDiff(
    '<div data-inline-leaf>a<strong>b</strong>c</div>',
    '<div data-inline-leaf>ab<strong>c</strong></div>'
  )
  const tr = createTransaction()
  let dispatchedTransaction = null
  const extensions = [StarterKit, InlineLeafExtension]

  const result = showStructuredDiff({
    tr,
    state: createEditorStateFromHtml('<div data-inline-leaf>ab<strong>c</strong></div>', extensions),
    dispatch: nextTr => {
      dispatchedTransaction = nextTr
    },
    editor: {
      extensionManager: {
        extensions,
      },
    },
  })

  assert.equal(result, true)
  assert.equal(dispatchedTransaction, tr)
  assert.equal(dispatchedTransaction.meta.value.type, 'showDiff')
  assert.equal(dispatchedTransaction.meta.value.diffs.length, 1)
  assert.equal(dispatchedTransaction.meta.value.diffs[0].type, 'modify')
})
