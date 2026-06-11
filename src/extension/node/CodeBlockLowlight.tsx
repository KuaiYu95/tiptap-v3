// @ts-nocheck

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { all, createLowlight } from 'lowlight';
import CodeBlockView from "../component/CodeBlock";

const lowlight = createLowlight(all)

const CustomCodeBlock = CodeBlockLowlight.configure({
  enableTabIndentation: true,
  tabSize: 1,
  lowlight,
}).extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      title: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-title'),
        renderHTML: (attributes: { title?: string }) => {
          if (!attributes.title) {
            return {}
          }
          return {
            'data-title': attributes.title,
          }
        },
      },
    }
  },
  parseMarkdown: (token, helpers) => {
    const isFenced = token.codeBlockStyle === 'fenced' ||
      (token.raw && /^\s*```/.test(token.raw));
    const isIndented = token.codeBlockStyle === 'indented';
    if (!isFenced && !isIndented) {
      return []
    }

    if (token.lang === 'mermaid') {
      return helpers.createNode(
        'flow',
        { code: token.text || '', width: '100%' },
        []
      )
    }
    return helpers.createNode(
      'codeBlock',
      { language: token.lang || null },
      token.text ? [helpers.createTextNode(token.text)] : [],
    )
  },
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView)
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('codeBlockCopyPlainText'),
        view(editorView) {
          const handler = (event: ClipboardEvent) => {
            const { state } = editorView;
            const { selection } = state;
            const { $from, $to, empty } = selection;
            if (empty) return;
            let node = $from.node($from.depth);
            if (node.type.name !== 'codeBlock') {
              node = $from.node($from.depth - 1);
            }
            if (!node || node.type.name !== 'codeBlock') return;
            const $toNode = $to.node($to.depth) === node || $to.node($to.depth - 1) === node;
            if (!$toNode) return;
            const selectedText = state.doc.textBetween($from.pos, $to.pos, '\n');
            event.clipboardData?.clearData();
            event.clipboardData?.setData('text/plain', selectedText);
            event.preventDefault();
            event.stopImmediatePropagation();
          };
          editorView.dom.addEventListener('copy', handler, true);
          return {
            destroy() {
              editorView.dom.removeEventListener('copy', handler, true);
            },
          };
        },
      }),
    ];
  },
})

export const CodeBlockLowlightExtension = CustomCodeBlock