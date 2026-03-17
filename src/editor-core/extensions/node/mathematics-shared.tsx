import { EditorFnProps } from '../../../types';
import { ReactNodeViewRenderer } from '@tiptap/react';
import React from 'react';
import { MathematicsBlockViewWrapper, MathematicsInlineViewWrapper } from '../component/Mathematics';

export const createMathInsertCommand =
  (type: string) =>
    (options: { latex: string }) =>
      ({ commands }: any) =>
        commands.insertContent({
          type,
          attrs: {
            latex: options.latex,
          },
        });

export const createMathKeyboardShortcut =
  (type: string) =>
    () =>
      ({ editor }: any) =>
        editor.commands.insertContent({
          type,
          attrs: {
            latex: '',
          },
        });

export const createInlineMathNodeView = (options: EditorFnProps) =>
  ReactNodeViewRenderer((renderProps) => <MathematicsInlineViewWrapper {...renderProps} {...options} />);

export const createBlockMathNodeView = (options: EditorFnProps) =>
  ReactNodeViewRenderer((renderProps) => <MathematicsBlockViewWrapper {...renderProps} {...options} />);
