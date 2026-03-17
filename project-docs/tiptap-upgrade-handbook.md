# Tiptap Upgrade Handbook

本文档整合 Tiptap 升级分类、升级计划、升级结果与后续策略，作为后续升级的统一入口。

## 1. 升级分类

扩展分类标准：

- `official-core`
  - 直接使用上游能力
- `official-wrapper`
  - 轻包装上游能力
- `compat-patch`
  - 历史兼容补丁，未来可能被上游覆盖
- `business-extension`
  - 产品特有 schema 或 NodeView
- `product-support`
  - 上传、差异对比、命令入口等产品支持能力

当前机器可读来源：

- [src/editor-core/extensions/catalog.ts](/Users/ky/Desktop/tiptap-v3/src/editor-core/extensions/catalog.ts)

运行时装配层：

- [src/editor-core/extensions/builders.tsx](/Users/ky/Desktop/tiptap-v3/src/editor-core/extensions/builders.tsx)

## 2. 当前升级目标与状态

- 当前统一目标版本：`3.20.2`
- 所有 `@tiptap/*` 依赖已统一升级到 `3.20.2`
- `pnpm install` 已完成
- `pnpm build` 已通过

补齐的 peer 依赖：

- `@tiptap/extension-drag-handle`
- `@tiptap/extension-collaboration`
- `@tiptap/extension-node-range`
- `@tiptap/y-tiptap`

## 3. 升级顺序

### 第 1 步：依赖对齐

- 将所有 `@tiptap/*` 依赖统一到同一版本族
- 重新安装依赖并生成锁文件变更

### 第 2 步：编译修复

优先处理 API、类型和入口变动：

- `@tiptap/react`
- `@tiptap/markdown`
- `@tiptap/extension-bubble-menu`
- `@tiptap/extension-drag-handle-react`
- `@tiptap/extension-code-block-lowlight`

### 第 3 步：兼容补丁审计

优先复核：

- `CodeExtension`
- `ImeComposition`
- `TableExtension`
- `CustomBlockMathExtension`
- `CustomInlineMathExtension`

### 第 4 步：业务扩展回归

优先验证：

- `InlineLinkExtension`
- `BlockLinkExtension`
- `CodeBlockLowlightExtension`
- `ImageExtension`
- `VideoExtension`
- `AudioExtension`
- `IframeExtension`
- `InlineAttachmentExtension`
- `BlockAttachmentExtension`
- `VerticalAlign`
- `Indent`
- `ExcalidrawExtension`

### 第 5 步：产品支持链路回归

- `TableOfContents`
- `FileHandlerExtension`
- `UploadProgressExtension`
- `InlineUploadProgressExtension`
- `SlashCommands`
- `AiWritingExtension`
- `StructuredDiffExtension`
- `EditorMarkdown`

## 4. 升级结果摘要

### 已对齐的上游能力

- `CustomBubbleMenu`
  - 使用独立 `pluginKey`
- `CustomDragHandle`
  - 使用独立 `pluginKey`
  - 后续又按产品需求取消 `nested`
- `Image / Video / Iframe`
  - 显式恢复 `data-drag-handle`
- `CodeBlockLowlightExtension`
  - 改为命名导入，对齐 lowlight runtime 修复
- `EditorMarkdown`
  - 受控/非受控同步重新收稳

### 明确保留的业务行为

- `InlineLinkExtension`
  - `text / icon / block` 三种展示模式继续保留
- `CodeBlockLowlightExtension`
  - title 元数据
  - 自定义 NodeView
  - `mermaid -> flow` 转换
- 媒体节点
  - 图片裁切
  - 视频/iframe 编辑弹层
  - 共享 resize / hover toolbar 基座
- `Indent`
  - 跨多种业务节点的缩进策略继续保留

### 仍保留的 compat patch

- `CodeExtension`
- `ImeComposition`
- `TableExtension`
- `CustomBlockMathExtension`
- `CustomInlineMathExtension`

## 5. 当前高优先级审计结论

### 高优先级 compat patch

- `CodeExtension`
  - 继续允许 `code` 与 `textStyle` 共存
  - 下一轮升级优先尝试回收
- `ImeComposition`
  - 保留为 IME 和 TOC 的共享契约
- `TableExtension`
  - 仍承载本地拖拽、定位、选择和覆盖层逻辑

### 业务扩展中必须稳定保留的

- `InlineLinkExtension`
- `BlockLinkExtension`
- `ImageExtension`
- `VideoExtension`
- `AudioExtension`
- `IframeExtension`
- `InlineAttachmentExtension`
- `BlockAttachmentExtension`
- `CodeBlockLowlightExtension`
- `VerticalAlign`
- `Indent`
- `ExcalidrawExtension`

## 6. Remaining Follow-Up

1. `AudioExtension`
   - 对照 upstream 原生 audio extension 做能力差异审计
2. `TableExtension`
   - 继续薄化本地表格子系统
3. `CustomBlockMathExtension / CustomInlineMathExtension`
   - 对照 upstream 数学能力，继续回收历史兼容逻辑
4. `InlineLinkExtension`
   - 如果以后要吸收 upstream HTML title 语义，需要先拆开“显示文本 title”和“HTML title”两层数据

## 7. 下一轮升级时的使用方式

升级前先看：

1. [src/editor-core/extensions/catalog.ts](/Users/ky/Desktop/tiptap-v3/src/editor-core/extensions/catalog.ts)
2. 本文档

升级中优先处理：

1. `compat-patch`
2. `official-wrapper`
3. `product-support`
4. `business-extension`

升级后记录：

- 哪些补丁已经被 upstream 覆盖
- 哪些业务扩展仍必须保留
- 哪些行为需要加入回归清单
