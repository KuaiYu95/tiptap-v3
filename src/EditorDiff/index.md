# EditorDiff

现有用法保持不变，升级后无需调整业务代码。
当前能力定位为只读结构化 diff 展示，本轮优化默认增强了无差异清理和删除节点预览。
如需更细粒度控制，可选传入 `diffOptions`，例如忽略节点或 mark 上的特定属性变更，或通过 `engine: 'enhanced'` 为特殊 inline block 与重排场景启用更细粒度 diff；不传时默认行为不变。

<code src='./demo.tsx'></code>
