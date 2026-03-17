import Code from '@tiptap/extension-code'

// 允许与 textStyle 等标记共存，以便字号/颜色等样式可应用到 code 文本
export const CodeExtension = Code.extend({
  // 默认 `@tiptap/extension-code` 的 excludes 为 '_'（排除所有其他 mark）
  // 这里清空以允许共存，从而让 textStyle 的 fontSize 生效
  excludes: '',
})

export default CodeExtension

