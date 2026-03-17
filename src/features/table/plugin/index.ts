import { Extension } from '@tiptap/core';
import type { TableHandlesState } from './shared';
import {
  TableHandlePlugin,
} from './plugin';
import { tableHandlePluginKey } from './shared';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableHandle: {
      freezeHandles: () => ReturnType;
      unfreezeHandles: () => ReturnType;
    };
  }

  interface EditorEvents {
    tableHandleState: TableHandlesState;
  }
}

export const TableHandleExtension = Extension.create({
  name: 'tableHandleExtension',

  addCommands() {
    return {
      freezeHandles:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) tr.setMeta(tableHandlePluginKey, true);
          return true;
        },

      unfreezeHandles:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) tr.setMeta(tableHandlePluginKey, false);
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const { editor } = this;
    return [
      TableHandlePlugin(editor, (state) => {
        this.editor.emit('tableHandleState', state);
      }),
    ];
  },
});

export * from './plugin';
export * from './drag-helpers';
export * from './shared';
