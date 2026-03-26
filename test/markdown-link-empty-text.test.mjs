import assert from 'node:assert/strict'
import test from 'node:test'
import { InlineLinkExtension } from '../dist/extension/node/Link/index.js'

test('InlineLinkExtension markdown parser does not create empty text nodes for []()', () => {
  const helpers = {
    createNode: (type, attrs, content) => ({ type, attrs, content }),
    createTextNode: text => ({ type: 'text', text }),
  }

  const result = InlineLinkExtension.config.parseMarkdown({ href: '', text: '' }, helpers)

  assert.deepEqual(result, {
    type: 'inlineLink',
    attrs: {
      href: '',
      title: '',
      type: 'icon',
      target: '_blank',
    },
    content: [],
  })
})
