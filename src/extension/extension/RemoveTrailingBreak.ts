import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';

/**
 * Extension to remove trailing empty paragraph node when editor is not editable
 *
 * ProseMirror/Tiptap adds a trailing empty paragraph with a trailingBreak for editing purposes.
 * This extension removes it when the editor is in readonly mode.
 */
const removeTrailingBreakPluginKey = new PluginKey('removeTrailingBreak');

/**
 * Check if a paragraph node is empty (only contains a trailingBreak or is completely empty)
 */
function isEmptyParagraph(node: any): boolean {
  if (node?.type.name !== 'paragraph') {
    return false;
  }

  // Check if paragraph has no content
  if (node.childCount === 0) {
    return true;
  }

  // Check if paragraph only contains a trailingBreak (br element with ProseMirror-trailingBreak class)
  // or only contains whitespace text
  if (node.textContent.trim() === '') {
    // Check if it only has a hardBreak (which is the trailingBreak)
    if (node.childCount === 1) {
      const child = node.firstChild;
      if (child?.type.name === 'hardBreak') {
        return true;
      }
    }
    // Or if it's just empty text
    return true;
  }

  return false;
}

/**
 * Remove trailing empty paragraph with trailingBreak from DOM
 */
function removeTrailingBreakFromDOM(view: EditorView) {
  const editorElement = view.dom;
  if (!editorElement) return;

  // Find all paragraphs
  const paragraphs = Array.from(editorElement.querySelectorAll('p'));
  if (paragraphs.length === 0) return;

  const lastParagraph = paragraphs.at(-1);
  if (!lastParagraph) return;
  const trailingBreak = lastParagraph.querySelector(
    'br.ProseMirror-trailingBreak',
  );

  // If the paragraph only contains the trailingBreak (or is empty), remove it
  if (trailingBreak && lastParagraph.textContent.trim() === '') {
    // Check if paragraph only has the trailingBreak or is completely empty
    const hasOnlyTrailingBreak =
      lastParagraph.childNodes.length === 1 &&
      lastParagraph.firstChild === trailingBreak;

    if (hasOnlyTrailingBreak || lastParagraph.childNodes.length === 0) {
      lastParagraph.remove();
    } else {
      // Just remove the trailingBreak element
      trailingBreak.remove();
    }
  } else if (
    !trailingBreak &&
    lastParagraph.textContent.trim() === '' &&
    lastParagraph.childNodes.length === 0
  ) {
    // Empty paragraph without trailingBreak, also remove it
    lastParagraph.remove();
  }
}

export const RemoveTrailingBreak = Extension.create({
  name: 'removeTrailingBreak',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: removeTrailingBreakPluginKey,
        appendTransaction: (transactions, oldState, newState) => {
          // Get the view to check if editor is editable
          const view = (newState as any).__view as EditorView | undefined;
          if (!view) {
            return null;
          }

          // Only process if editor is not editable
          if (view.editable) {
            return null;
          }

          const { doc } = newState;

          // Check if document has content
          if (doc.childCount === 0) {
            return null;
          }

          const lastChild = doc.lastChild;
          if (!lastChild || !isEmptyParagraph(lastChild)) {
            return null;
          }

          // Remove the trailing empty paragraph
          const tr = newState.tr;
          const lastChildPos = doc.content.size - lastChild.nodeSize;
          tr.delete(lastChildPos, doc.content.size);

          return tr;
        },
        view: (view) => {
          // Function to clean up DOM (only DOM manipulation, no document changes)
          const cleanupDOM = () => {
            if (view.editable) {
              return;
            }
            removeTrailingBreakFromDOM(view);
          };

          // Clean up DOM on initial render
          setTimeout(() => {
            cleanupDOM();
          }, 0);

          // Use MutationObserver to watch for DOM changes
          let observer: MutationObserver | null = null;
          if (!view.editable && typeof MutationObserver !== 'undefined') {
            observer = new MutationObserver(() => {
              cleanupDOM();
            });
            observer.observe(view.dom, {
              childList: true,
              subtree: true,
            });
          }

          return {
            update: (view, prevState) => {
              // Check if document changed, then clean up DOM
              if (view.state.doc !== prevState.doc) {
                setTimeout(() => {
                  cleanupDOM();
                }, 0);
              }
            },
            destroy: () => {
              if (observer) {
                observer.disconnect();
              }
            },
          };
        },
      }),
    ];
  },
});
