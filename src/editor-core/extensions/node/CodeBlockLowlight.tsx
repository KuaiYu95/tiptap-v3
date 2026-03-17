// @ts-nocheck

import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { all, createLowlight } from 'lowlight';
import CodeBlockView from "../component/CodeBlock";
import { createCodeBlockTitleAttribute, parseCodeBlockMarkdownToken } from "./code-block-lowlight-shared";

const lowlight = createLowlight(all)

const CustomCodeBlock = CodeBlockLowlight.configure({
  enableTabIndentation: true,
  tabSize: 1,
  lowlight,
}).extend({
  // Keep local title metadata and markdown-to-flow conversion behavior even if
  // upstream code block lowlight fixes continue to land in newer Tiptap releases.
  addAttributes() {
    return {
      ...this.parent?.(),
      ...createCodeBlockTitleAttribute(),
    }
  },
  parseMarkdown: parseCodeBlockMarkdownToken,
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView)
  },
})

export const CodeBlockLowlightExtension = CustomCodeBlock
