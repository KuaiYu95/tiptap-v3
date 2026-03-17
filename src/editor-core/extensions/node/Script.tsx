
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';

export const CustomSubscript = Subscript.extend({
  markdownTokenName: 'sub',
  renderMarkdown: (node: any, helpers: any) => {
    const content = helpers.renderChildren(node)
    return `~${content}~`
  },
  parseMarkdown: (token: any, helpers: any) => {
    const content = helpers.parseInline(token.tokens || [])
    if (!content.length && token.text) {
      content.push(helpers.createTextNode(token.text))
    }
    return helpers.applyMark('subscript', content)
  },
  markdownTokenizer: {
    name: 'sub',
    level: 'inline',
    start: (src: string) => src.indexOf('~'),
    tokenize(src: string, _tokens: any, helpers: any) {
      const match = /^~(?!~)([\s\S]+?)~(?!~)/.exec(src)
      if (!match) {
        return
      }

      const innerContent = match[1]
      return {
        type: 'sub',
        raw: match[0],
        text: innerContent,
        tokens: helpers.inlineTokens(innerContent),
      }
    },
  },
})

export const CustomSuperscript = Superscript.extend({
  markdownTokenName: 'sup',
  renderMarkdown: (node: any, helpers: any) => {
    const content = helpers.renderChildren(node)
    return `^${content}^`
  },
  parseMarkdown: (token: any, helpers: any) => {
    const content = helpers.parseInline(token.tokens || [])
    if (!content.length && token.text) {
      content.push(helpers.createTextNode(token.text))
    }
    return helpers.applyMark('superscript', content)
  },
  markdownTokenizer: {
    name: 'sup',
    level: 'inline',
    start: (src: string) => src.indexOf('^'),
    tokenize(src: string, _tokens: any, helpers: any) {
      const match = /^\^(?!\^)([\s\S]+?)\^(?!\^)/.exec(src)
      if (!match) {
        return
      }

      const innerContent = match[1]
      return {
        type: 'sup',
        raw: match[0],
        text: innerContent,
        tokens: helpers.inlineTokens(innerContent),
      }
    },
  },
})