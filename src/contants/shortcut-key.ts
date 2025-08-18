export const MAC_SYMBOLS = {
  ctrl: "⌘",
  alt: "⌥",
  shift: "⇧",
  enter: "↵",
}

export const SHORTCUT_KEYS = {
  'Essentials': {
    label: '基础',
    keys: [
      { label: '复制', value: 'Copy', keys: ['ctrl', 'C'] },
      { label: '剪切', value: 'Cut', keys: ['ctrl', 'X'] },
      { label: '粘贴', value: 'Paste', keys: ['ctrl', 'V'] },
      { label: '粘贴纯文本', value: 'Paste without formatting', keys: ['ctrl', 'shift', 'V'] },
      { label: '撤销', value: 'Undo', keys: ['ctrl', 'Z'] },
      { label: '重做', value: 'Redo', keys: ['ctrl', 'shift', 'Z'] },
      { label: '换行', value: 'Add a line break', keys: ['ctrl', 'enter'] },
      { label: '保存', value: 'Save', keys: ['ctrl', 'S'] },
    ],
  },

  'Insert': {
    label: '插入',
    keys: [
      { label: '链接', value: 'Link', keys: ['ctrl', '1'] },
      { label: '图片', value: 'Image', keys: ['ctrl', '2'] },
      { label: '视频', value: 'Video', keys: ['ctrl', '3'] },
      { label: '音频', value: 'Audio', keys: ['ctrl', '4'] },
      { label: '附件', value: 'Attachment', keys: ['ctrl', '5'] },
      { label: '行内数学公式', value: 'Inline Math', keys: ['ctrl', '6'] },
      { label: '块级数学公式', value: 'Block Math', keys: ['ctrl', '7'] },
      { label: '折叠块', value: 'Details', keys: ['ctrl', '8'] },
      { label: '表格', value: 'Table', keys: ['ctrl', '9'] },
    ],
  },
  'Text Formatting': {
    label: '文本格式',
    keys: [
      { label: '加粗', value: 'Bold', keys: ['ctrl', 'B'] },
      { label: '斜体', value: 'Italic', keys: ['ctrl', 'I'] },
      { label: '下划线', value: 'Underline', keys: ['ctrl', 'U'] },
      { label: '删除线', value: 'Strikethrough', keys: ['ctrl', 'shift', 'S'] },
      { label: '高亮', value: 'Highlight', keys: ['ctrl', 'shift', 'H'] },
      { label: '代码', value: 'Code', keys: ['ctrl', 'E'] },
    ],
  },
  'Paragraph Formatting': {
    label: '段落格式',
    keys: [
      { label: '文本', value: 'Normal Text', keys: ['ctrl', 'alt', '0'] },
      { label: '标题 1', value: 'Heading 1', keys: ['ctrl', 'alt', '1'] },
      { label: '标题 2', value: 'Heading 2', keys: ['ctrl', 'alt', '2'] },
      { label: '标题 3', value: 'Heading 3', keys: ['ctrl', 'alt', '3'] },
      { label: '标题 4', value: 'Heading 4', keys: ['ctrl', 'alt', '4'] },
      { label: '标题 5', value: 'Heading 5', keys: ['ctrl', 'alt', '5'] },
      { label: '标题 6', value: 'Heading 6', keys: ['ctrl', 'alt', '6'] },
      { label: '有序列表', value: 'Ordered list', keys: ['ctrl', 'shift', '7'] },
      { label: '无序列表', value: 'Bullet list', keys: ['ctrl', 'shift', '8'] },
      { label: '待办列表', value: 'Task list', keys: ['ctrl', 'shift', '9'] },
      { label: '引用块', value: 'Blockquote', keys: ['ctrl', 'shift', 'B'] },
      { label: '左对齐', value: 'Left align', keys: ['ctrl', 'shift', 'L'] },
      { label: '居中对齐', value: 'Center align', keys: ['ctrl', 'shift', 'E'] },
      { label: '右对齐', value: 'Right align', keys: ['ctrl', 'shift', 'R'] },
      { label: '两端对齐', value: 'Justify', keys: ['ctrl', 'shift', 'J'] },
      { label: '代码块', value: 'Code block', keys: ['ctrl', 'alt', 'C'] },
      { label: '下标', value: 'Subscript', keys: ['ctrl', ','] },
      { label: '上标', value: 'Superscript', keys: ['ctrl', '.'] },
    ],
  },
  'Text Selection': {
    label: '文本选择',
    keys: [
      { label: '全选', value: 'Select all', keys: ['ctrl', 'A'] },
      { label: '选择向左扩展一个字符', value: 'Extend selection one character to left', keys: ['shift', '←'] },
      { label: '选择向右扩展一个字符', value: 'Extend selection one character to right', keys: ['shift', '→'] },
      { label: '选择向上扩展一行', value: 'Extend selection one line up', keys: ['shift', '↑'] },
      { label: '选择向下扩展一行', value: 'Extend selection one line down', keys: ['shift', '↓'] },
    ],
  },
}