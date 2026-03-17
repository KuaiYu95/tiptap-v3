import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import InlineUploadProgressView, { InlineUploadProgressAttributes } from '../component/UploadProgress/Inline';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineUploadProgress: {
      setInlineUploadProgress: (options: InlineUploadProgressAttributes) => ReturnType;
      updateInlineUploadProgress: (tempId: string, progress: number) => ReturnType;
      removeInlineUploadProgress: (tempId: string) => ReturnType;
    };
  }
}

export const InlineUploadProgressExtension = Node.create({
  name: 'inlineUploadProgress',
  group: 'inline',
  inline: true,
  atom: true,
  draggable: false,
  selectable: false,

  addAttributes() {
    return {
      fileName: {
        default: '',
        parseHTML: element => element.getAttribute('data-file-name'),
        renderHTML: attributes => {
          if (!attributes.fileName) {
            return {};
          }
          return {
            'data-file-name': attributes.fileName,
          };
        },
      },
      fileType: {
        default: 'image',
        parseHTML: element => element.getAttribute('data-file-type'),
        renderHTML: attributes => {
          if (!attributes.fileType) {
            return {};
          }
          return {
            'data-file-type': attributes.fileType,
          };
        },
      },
      progress: {
        default: 0,
        parseHTML: element => parseFloat(element.getAttribute('data-progress') || '0'),
        renderHTML: attributes => {
          return {
            'data-progress': attributes.progress,
          };
        },
      },
      tempId: {
        default: '',
        parseHTML: element => element.getAttribute('data-temp-id'),
        renderHTML: attributes => {
          if (!attributes.tempId) {
            return {};
          }
          return {
            'data-temp-id': attributes.tempId,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="inline-upload-progress"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ 'data-type': 'inline-upload-progress' }, HTMLAttributes)];
  },

  addCommands() {
    return {
      setInlineUploadProgress: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
      updateInlineUploadProgress: (tempId, progress) => ({ tr, state }) => {
        const { doc } = state;
        let updated = false;

        doc.descendants((node, pos) => {
          if (node.type.name === this.name && node.attrs.tempId === tempId) {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              progress,
            });
            updated = true;
            return false;
          }
        });

        return updated;
      },
      removeInlineUploadProgress: (tempId) => ({ tr, state }) => {
        const { doc } = state;
        let removed = false;

        doc.descendants((node, pos) => {
          if (node.type.name === this.name && node.attrs.tempId === tempId) {
            tr.delete(pos, pos + node.nodeSize);
            removed = true;
            return false;
          }
        });

        return removed;
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineUploadProgressView);
  },
});

