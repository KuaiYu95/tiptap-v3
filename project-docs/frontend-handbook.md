# Frontend Handbook

本文档整合项目前端架构、目录规范、迁移结果与优化路线，作为后续编辑器持续演进的统一基线。

## 1. 架构目标

本项目的前端架构需要同时满足三件事：

1. 能持续跟随上游 Tiptap 版本迭代
2. 二次开发能力可组件化、可复用、可替换
3. 编辑器交互复杂度增长时，维护成本不会线性爆炸

## 2. 前端设计模式

### 2.1 分层设计

项目统一按以下分层理解：

- `app`
  - 产品装配层
  - 负责组合 `Editor`、`EditorDiff`、`EditorMarkdown` 等产品出口
- `features`
  - 编辑器子系统层
  - 负责 `toolbar`、`drag-handle`、`table`、`markdown`、`media`
- `editor-core/extensions`
  - Tiptap 扩展层
  - 负责 schema、commands、plugin、mark、suggestion、compat patch
- `components`
  - 纯 UI 与共享交互层
  - 负责 menu、popover、toolbar item、shared hooks、icons
- `utils`
  - 领域工具层
  - 负责文件、markdown、table、resource extractor 等纯工具能力

### 2.2 推荐模式

高频场景统一采用以下模式：

- 装配层 + 配置层 + 渲染层
  - 适用于 `EditorToolbar`、`EditorMarkdown/Toolbar`
- shared hook + shared shell
  - 适用于 `Popover`、`Menu`、`Media NodeView`
- builder / registry
  - 适用于 `CustomDragHandle`、`TableHandleMenu`、`EditorInsert`
- upstream wrapper / compat patch / business extension 三分法
  - 适用于所有 `src/editor-core/extensions/*`

### 2.3 当前已落地模式

- 扩展装配分层：
  - [src/editor-core/extensions/builders.tsx](/Users/ky/Desktop/tiptap-v3/src/editor-core/extensions/builders.tsx)
- 升级分类 catalog：
  - [src/editor-core/extensions/catalog.ts](/Users/ky/Desktop/tiptap-v3/src/editor-core/extensions/catalog.ts)
- 共享弹层基础件：
  - [src/components/shared](/Users/ky/Desktop/tiptap-v3/src/components/shared)
- 媒体共享基座：
  - [src/features/media/shared](/Users/ky/Desktop/tiptap-v3/src/features/media/shared)
- `CustomDragHandle` 子系统化：
  - [src/features/drag-handle](/Users/ky/Desktop/tiptap-v3/src/features/drag-handle)
- 表格子系统化：
  - [src/features/table/plugin](/Users/ky/Desktop/tiptap-v3/src/features/table/plugin)
  - [src/features/table/TableHandle](/Users/ky/Desktop/tiptap-v3/src/features/table/TableHandle)

## 3. 前端设计规范

### 3.1 组件职责规范

- 页面或产品出口组件必须尽量薄
- 单个组件不要同时承担：
  - 状态同步
  - 命令定义
  - UI 渲染
  - 数据转换
  - DOM 事件管理
- 复杂功能必须拆成：
  - state hook
  - shared renderer
  - action builder 或 config

### 3.2 hook 规范

- 状态同步类 hook 统一使用 `use-xxx-sync`
- 定位与弹层类 hook 统一使用 `use-xxx-popover` / `use-xxx-positioning`
- 上传类 hook 统一使用 `use-xxx-upload`
- hook 只负责状态和副作用，不直接输出复杂业务 JSX

### 3.3 builder / config 规范

- 满足以下任一条件时，必须抽出 builder 或 config：
  - 菜单项超过 5 个
  - 同类菜单存在两处以上复用
  - 条件分支与 UI 组合混在一起
- builder 负责生成声明式配置
- config 负责按钮定义、图标、快捷键、启用条件

### 3.4 编辑器组件规范

- 编辑态、只读态、插入态、编辑弹层必须分离
- NodeView 组件优先复用 shared 基座，不重复写 resize / hover / popover 状态机
- 所有扩展必须明确标记为：
  - `official-core`
  - `official-wrapper`
  - `compat-patch`
  - `business-extension`
  - `product-support`

### 3.5 依赖规范

- 源码内部禁止再使用 `@ctzhian/tiptap/...` 自引用
- 内部模块统一走真实内部路径
- 公共入口只从 [src/index.ts](/Users/ky/Desktop/tiptap-v3/src/index.ts) 暴露

## 4. 当前目录规范

当前目录已经形成以下稳定语义：

- [src/app/editor](/Users/ky/Desktop/tiptap-v3/src/app/editor)
  - 产品装配层与 demo 出口
- [src/features/toolbar](/Users/ky/Desktop/tiptap-v3/src/features/toolbar)
  - 工具栏 feature
- [src/features/drag-handle](/Users/ky/Desktop/tiptap-v3/src/features/drag-handle)
  - 拖拽手柄交互子系统
- [src/features/table](/Users/ky/Desktop/tiptap-v3/src/features/table)
  - 表格 plugin 与表格 UI 子系统
- [src/features/markdown](/Users/ky/Desktop/tiptap-v3/src/features/markdown)
  - Markdown feature 实现层
- [src/features/media](/Users/ky/Desktop/tiptap-v3/src/features/media)
  - `image / video / iframe` 与共享媒体能力
- [src/editor-core/extensions](/Users/ky/Desktop/tiptap-v3/src/editor-core/extensions)
  - Tiptap 扩展核心层
- [src/components](/Users/ky/Desktop/tiptap-v3/src/components)
  - 纯 UI 与共享交互原语
- [src/constants](/Users/ky/Desktop/tiptap-v3/src/constants)
  - 常量统一入口
- [src/types](/Users/ky/Desktop/tiptap-v3/src/types)
  - 类型统一入口
- [src/utils](/Users/ky/Desktop/tiptap-v3/src/utils)
  - 公共领域工具
  - 已按语义沉出：
    - [src/utils/file](/Users/ky/Desktop/tiptap-v3/src/utils/file)
    - [src/utils/table](/Users/ky/Desktop/tiptap-v3/src/utils/table)
    - [src/utils/diff](/Users/ky/Desktop/tiptap-v3/src/utils/diff)
    - [src/utils/resource.ts](/Users/ky/Desktop/tiptap-v3/src/utils/resource.ts)
    - [src/utils/editor.ts](/Users/ky/Desktop/tiptap-v3/src/utils/editor.ts)
    - [src/utils/link.ts](/Users/ky/Desktop/tiptap-v3/src/utils/link.ts)
    - [src/utils/embed.ts](/Users/ky/Desktop/tiptap-v3/src/utils/embed.ts)

## 5. 迁移结果

本轮已经完成从历史目录到统一工程目录的核心迁移：

- `src/contants/*` -> `src/constants/*`
- `src/type/index.ts` -> `src/types/index.ts`
- `src/component/*` -> `src/components/*`
- `src/hook/*` -> `src/hooks/*`
- `src/util/*` -> `src/utils/*`
- `src/utils/index.ts` 杂项导出 -> `resource / editor / color / link / embed / file / table / diff`
- `src/extension/EditorToolbar/*` -> `src/features/toolbar/*`
- `src/component/CustomDragHandle/*` -> `src/features/drag-handle/*`
- `src/extension/node/TableHandler/*` + `src/extension/component/Table*/*` -> `src/features/table/*`
- `src/EditorMarkdown/*` 实现层 -> `src/features/markdown/*`
- `src/extension/component/Image|Video|Iframe/*` -> `src/features/media/*`
- `src/extension/*` -> `src/editor-core/extensions/*`
- `src/Editor/*` / `src/EditorDiff/*` / `src/EditorThemeProvider/*` -> `src/app/editor/*`

验证结果：

- `pnpm build` 已通过
- `src` 内部旧路径引用已同步更新

## 6. 优化路线

### 已完成

- Tiptap upgrade baseline 已对齐到 `3.20.2`
- extension assembly 已分层并建立 catalog
- toolbar、popover、media、table、markdown、drag-handle 已沉淀 shared primitives
- 源码内部 package self-import 已移除

### 当前仍值得持续推进

1. 围绕真实浏览器交互维护一份手工回归清单
2. 持续薄化 `CustomDragHandle`
3. 持续薄化 `TableExtension`
4. 继续把资源节点表单、attrs、上传流程做成共享能力

## 8. Utils 规范

- `src/utils/index.ts` 只做聚合导出，不再继续承载大段业务实现
- 文件下载、文件处理、文件上传辅助统一放到 [src/utils/file](/Users/ky/Desktop/tiptap-v3/src/utils/file)
- 表格专用工具统一从 [src/utils/table](/Users/ky/Desktop/tiptap-v3/src/utils/table) 进入
- 结构化 diff 专用工具统一从 [src/utils/diff](/Users/ky/Desktop/tiptap-v3/src/utils/diff) 进入
- baseUrl、资源地址处理统一放到 [src/utils/resource.ts](/Users/ky/Desktop/tiptap-v3/src/utils/resource.ts)
- 编辑器选区和节点辅助统一放到 [src/utils/editor.ts](/Users/ky/Desktop/tiptap-v3/src/utils/editor.ts)
- 链接与嵌入地址处理统一放到 [src/utils/link.ts](/Users/ky/Desktop/tiptap-v3/src/utils/link.ts) 和 [src/utils/embed.ts](/Users/ky/Desktop/tiptap-v3/src/utils/embed.ts)

## 7. 子系统规范

### Toolbar

- 主文件只负责 section 装配
- 按钮配置集中在 config
- 复杂菜单集中在 builder

### Drag Handle

- 节点上下文、动作构建、UI 壳子必须分离
- 行为优先配置化

### Table

- plugin 状态、几何计算、React UI 必须拆层
- 行列菜单与单元格菜单复用 builder

### Markdown

- 输入链、上传链、显示模式、同步链分 hook 管理
- 主组件只负责装配 Ace 与 Preview

### Media

- 宽度、resize、hover toolbar、edit popover 统一走 shared 基座
- `Image / Video / Iframe` 只保留差异逻辑
