import { Editor, Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { DecorationSet } from '@tiptap/pm/view';
import { createDecorationsFromDiffs, createEmptyDecorationSet } from '../../util/decorations';
import { compareDocuments, DiffItem } from '../../util/structuredDiff';

const diffPluginKey = new PluginKey('structuredDiff');

class DiffPluginState {
  decorations: DecorationSet;
  diffs: DiffItem[];
  isActive: boolean;

  constructor(decorations: DecorationSet, diffs: DiffItem[] = [], isActive: boolean = false) {
    this.decorations = decorations;
    this.diffs = diffs;
    this.isActive = isActive;
  }

  static init(config: any, state: any): DiffPluginState {
    return new DiffPluginState(
      createEmptyDecorationSet(state.doc),
      [],
      false
    );
  }

  apply(tr: any, value: DiffPluginState, oldState: any, newState: any): DiffPluginState {
    if (tr.docChanged && value.isActive) {
      // 大范围替换时 mapping 可能失效，直接隐藏 diff 更安全
      try {
        const mappedDecorations = value.decorations.map(tr.mapping, tr.doc);
        return new DiffPluginState(mappedDecorations, value.diffs, value.isActive);
      } catch {
        return new DiffPluginState(createEmptyDecorationSet(newState.doc), [], false);
      }
    }

    const diffMeta = tr.getMeta(diffPluginKey);
    if (diffMeta) {
      switch (diffMeta.type) {
        case 'showDiff':
          return new DiffPluginState(
            diffMeta.decorations,
            diffMeta.diffs,
            true
          );

        case 'hideDiff':
          return new DiffPluginState(
            createEmptyDecorationSet(newState.doc),
            [],
            false
          );

        default:
          return value;
      }
    }

    return value;
  }
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    structuredDiff: {
      showStructuredDiff: (oldHtml: string, newHtml: string) => ReturnType
      hideStructuredDiff: () => ReturnType
    }
  }
}

export const StructuredDiffExtension = Extension.create({
  name: 'structuredDiff',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: diffPluginKey,
        state: {
          init: DiffPluginState.init,
          apply: DiffPluginState.prototype.apply
        },
        props: {
          decorations(state) {
            const pluginState = diffPluginKey.getState(state);
            return pluginState ? pluginState.decorations : null;
          }
        }
      })
    ];
  },

  addCommands() {
    return {
      showStructuredDiff: (oldHtml, newHtml) => ({ tr, state, dispatch, editor }) => {
        try {
          if (typeof oldHtml !== 'string' || typeof newHtml !== 'string') {
            console.warn('StructuredDiff: oldHtml 和 newHtml 必须为字符串');
            return false;
          }
          const extensions = editor?.extensionManager?.extensions;
          if (!extensions?.length) {
            console.warn('StructuredDiff: 未找到扩展配置');
            return false;
          }
          const comparison = compareDocuments(oldHtml, newHtml, extensions);

          if (!comparison.hasChanges) {
            const hideTr = tr.setMeta(diffPluginKey, { type: 'hideDiff' });
            if (dispatch) dispatch(hideTr);
            return true;
          }

          const decorations = createDecorationsFromDiffs(comparison.diffs, state.doc);

          const newTr = tr.setMeta(diffPluginKey, {
            type: 'showDiff',
            decorations,
            diffs: comparison.diffs
          });

          if (dispatch) {
            dispatch(newTr);
          }

          return true;
        } catch (error) {
          console.error('显示结构化diff时出错:', error);
          return false;
        }
      },
      hideStructuredDiff: () => ({ tr, state, dispatch }) => {
        try {
          const newTr = tr.setMeta(diffPluginKey, {
            type: 'hideDiff'
          });
          if (dispatch) dispatch(newTr);
          return true;
        } catch (error) {
          console.error('隐藏结构化diff时出错:', error);
          return false;
        }
      }
    };
  }
});

export { diffPluginKey };

export function getDiffState(editor: Editor) {
  if (!editor || !editor.state) {
    return null;
  }

  const pluginState = diffPluginKey.getState(editor.state);
  return pluginState ? {
    isActive: pluginState.isActive,
    diffs: pluginState.diffs,
    diffCount: pluginState.diffs.length
  } : null;
}