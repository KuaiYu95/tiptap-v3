export const MARKDOWN_EDITOR_PLACEHOLDER = `标准 Markdown 语法速查（GFM 兼容）

# 标题一
## 标题二
### 标题三
#### 标题四  
##### 标题五
###### 标题六

*斜体* 或 _斜体_
**加粗** 或 __加粗__
***加粗斜体***
~~删除线~~
^上^标
~下~标
++下划线++

- [ ] functionA
- [x] functionB
- [ ] functionC

- 无序列表项 A
- 无序列表项 B
  - 无序列表项 B1

1. 有序列表项 A
2. 有序列表项 B
  a. 有序列表项 B1

行内代码：\`console.log("hi")\`

代码块（语法高亮）：
\`\`\`js
function hello() {
  console.log("hi");
}
\`\`\`

> 引用

>> 多重引用

[链接](https://example.com)
![图片](https://via.placeholder.com/600x400)
[![图片](https://via.placeholder.com/600x400)](https://example.com)

表格：
| 列1 | 列2 | 右对齐 |
|---|:---:|---:|
| 左 | 中 | 右 |
| a  | b  | 123 |

分隔线：
\`---\`

\`***\`

行内数学公式：$ E = mc^2 $
块级数学公式：
$$
\int_{0}^{1} x^2 \, dx = \frac{1}{3}
$$

警告块：
:::alert {variant="warning"}

这是一段警告块

:::

信息提示：
:::alert {variant="info"}

这是一个信息提示

:::

成功提示：
:::alert {variant="success"}

这是一个成功提示

:::

错误提示：
:::alert {variant="error"}

这是一个错误提示

:::

默认提示：
:::alert {variant="default"}

这是一个默认提示

:::

不带图标的信息提示：
:::alert {variant="info" type="text"}

这是一个不带图标的信息提示

:::

折叠面板 Details：
:::details {indent="0" open}

:::detailsSummary {indent="0"}

这是折叠面板的标题

:::

:::detailsContent {indent="0"}

这是折叠面板的内容，可以展示块级元素

:::

:::
`;
