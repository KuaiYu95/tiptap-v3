# @ctzhian/tiptap

[![NPM version](https://img.shields.io/npm/v/@ctzhian/tiptap.svg?style=flat)](https://npmjs.org/package/@ctzhian/tiptap)
[![NPM downloads](http://img.shields.io/npm/dm/@ctzhian/tiptap.svg?style=flat)](https://npmjs.org/package/@ctzhian/tiptap)

基于 Tiptap v3 二次开发的 React 富文本编辑器组件集，内置工具栏、主题、结构化 Diff、高亮、表格、附件/音视频/数学等常用扩展，开箱即用。

- 核心能力：`useTiptap`、`Editor`、`EditorToolbar`、`EditorDiff`
- 技术栈：React 18、Tiptap v3、MUI v7、Emotion 11

## 安装

```bash
pnpm add @ctzhian/tiptap
# 同时安装 peer 依赖
pnpm add @mui/material @mui/icons-material @emotion/react @emotion/styled
```

样式（必须）：

```ts
import '@ctzhian/tiptap/dist/index.css';
```

## 快速开始

```tsx
import React from 'react';
import {
  EditorThemeProvider,
  EditorToolbar,
  Editor,
  useTiptap,
} from '@ctzhian/tiptap';
import '@ctzhian/tiptap/dist/index.css';

export default function Demo() {
  const { editor } = useTiptap({
    editable: true,
    content: '<p>Hello Tiptap</p>',
    exclude: ['invisibleCharacters'],
    onSave: (ed) => console.log('save:', ed.getHTML()),
  });

  return (
    <EditorThemeProvider mode="light">
      <div
        style={{
          border: '1px solid #eee',
          borderRadius: 10,
          padding: '0 10px 10px',
        }}
      >
        <div style={{ borderBottom: '1px solid #eee', marginBottom: 30 }}>
          <EditorToolbar editor={editor} />
        </div>
        <Editor editor={editor} />
      </div>
    </EditorThemeProvider>
  );
}
```

## 模块说明

### useTiptap（核心 Hook）

创建并管理 Tiptap 实例，统一扩展与回调。

- 常用入参：
  - `editable?: boolean` 是否可编辑（默认 true）
  - `content?: string | JSON` 初始内容
  - `exclude?: string[]` 需要禁用的内置扩展名
  - `extensions?: Extension[]` 自定义扩展
  - `mentionItems?: string[]`、`onMentionFilter?: ({ query }) => Promise<string[]>`
  - `onSave?(editor)`、`onError?(error)`
  - `onUpload?(file, onProgress)` 自定义上传，返回可访问地址
  - `onTocUpdate?(toc)`、`onAiWritingGetSuggestion?({ prefix, suffix }) => Promise<string>`
- 返回：`{ editor, getText, getHTML, getJSON, getMarkdownByJSON }`

```tsx
const { editor } = useTiptap({
  editable: true,
  onSave: (ed) => console.log(ed.getHTML()),
  onUpload: async (file, onProgress) => {
    onProgress?.({ progress: 1 });
    return 'https://example.com/file/url';
  },
});
```

### EditorToolbar（工具栏）

与 `editor` 绑定的可视化工具栏：撤销/重做、标题/字号、加粗/斜体/上下标、颜色、列表、对齐、链接、更多菜单，以及 AI 伴写开关。

- Props：`{ editor: Editor; menuInToolbarMore?: ToolbarItemType[] }`

```tsx
<EditorToolbar
  editor={editor}
  menuInToolbarMore={[{ id: 'my-action', label: '自定义' }]}
/>
```

### Editor（编辑区）

渲染编辑区域，包含文字选择气泡菜单与拖拽锚点菜单。

- Props：`{ editor: Editor; menuInDragHandle?: MenuItem[]; menuInBubbleMenu?: MenuItem[]; onTip?: (type, tip) => void }`

```tsx
<Editor editor={editor} />
```

### EditorDiff（结构化对比）

以只读方式展示两段 HTML 的结构化差异。

- Props：`{ oldHtml: string; newHtml: string }`
- 可选增强：支持 `diffOptions`，例如通过 `ignoreAttrs` 忽略节点或 mark 上的指定属性差异，或通过 `engine: 'enhanced'` 为特殊 inline block 和重排场景启用更细粒度的 diff；未传时默认行为保持不变。
- 兼容性：现有接入方式无需调整，`v3.x` 内默认仍保持零配置升级。
- 当前定位：只读结构化 diff 展示，不等同于修订模式或 track changes。
- 本轮优化：自动清理“无差异时残留高亮”，并增强图片、附件、公式、音视频等删除节点的预览文案。

```tsx
<EditorDiff oldHtml={'<p>old</p>'} newHtml={'<p><strong>new</strong></p>'} />
```

## Development

```bash
# install dependencies
pnpm install

# develop library by docs demo
pnpm start

# build library source code
pnpm run build

# build library source code in watch mode
pnpm run build:watch

# build docs
pnpm run docs:build

# Locally preview the production build.
pnpm run docs:preview

# check your project for potential problems
pnpm run doctor
```

## LICENSE

MIT
