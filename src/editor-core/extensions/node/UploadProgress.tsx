import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import UploadProgressView, { UploadProgressAttributes } from '../component/UploadProgress';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    uploadProgress: {
      /**
       * Insert upload progress indicator
       */
      setUploadProgress: (options: UploadProgressAttributes) => ReturnType;
      /**
       * Update upload progress
       */
      updateUploadProgress: (tempId: string, progress: number) => ReturnType;
      /**
       * Remove upload progress indicator
       */
      removeUploadProgress: (tempId: string) => ReturnType;
    }
  }
}

export const UploadProgressExtension = Node.create({
  name: 'uploadProgress',
  group: 'block',
  atom: true,
  selectable: false,
  draggable: false,

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
        default: 'other',
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
        tag: 'div[data-type="upload-progress"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'upload-progress' }, HTMLAttributes)];
  },

  addCommands() {
    return {
      setUploadProgress: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
      updateUploadProgress: (tempId, progress) => ({ tr, state }) => {
        const { doc } = state;
        let updated = false;

        doc.descendants((node, pos) => {
          if (node.type.name === this.name && node.attrs.tempId === tempId) {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              progress,
            });
            updated = true;
            return false; // 停止遍历
          }
        });

        return updated;
      },
      removeUploadProgress: (tempId) => ({ tr, state }) => {
        const { doc } = state;
        let removed = false;

        doc.descendants((node, pos) => {
          if (node.type.name === this.name && node.attrs.tempId === tempId) {
            tr.delete(pos, pos + node.nodeSize);
            removed = true;
            return false; // 停止遍历
          }
        });

        return removed;
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(UploadProgressView);
  },
});