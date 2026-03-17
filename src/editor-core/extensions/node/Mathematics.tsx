import { EditorFnProps } from "../../../types";
import { BlockMath, InlineMath } from "@tiptap/extension-mathematics";
import {
  createBlockMathNodeView,
  createInlineMathNodeView,
  createMathInsertCommand,
  createMathKeyboardShortcut,
} from "./mathematics-shared";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    CustomInlineMath: {
      /**
       * Insert a inline math node with LaTeX string.
       * @param options - Options for inserting inline math.
       * @returns ReturnType
       */
      setInlineMath: (options: { latex: string }) => ReturnType
    }
    CustomBlockMath: {
      /**
       * Insert a block math node with LaTeX string.
       * @param options - Options for inserting block math.
       * @returns ReturnType
       */
      setBlockMath: (options: { latex: string }) => ReturnType
    }
  }
}

const CustomInlineMath = (options: EditorFnProps) => InlineMath.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-6': createMathKeyboardShortcut(this.name)(),
    }
  },

  addCommands() {
    return {
      setInlineMath: (options: { latex: string }) => createMathInsertCommand(this.name)(options),
    }
  },
  addNodeView() {
    return createInlineMathNodeView(options)
  },
})

const CustomBlockMath = (options: EditorFnProps) => BlockMath.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-7': createMathKeyboardShortcut(this.name)(),
    }
  },
  addCommands() {
    return {
      setBlockMath: (options: { latex: string }) => createMathInsertCommand(this.name)(options),
    }
  },
  addNodeView() {
    return createBlockMathNodeView(options)
  },
})

export const CustomInlineMathExtension = (options: EditorFnProps) => CustomInlineMath(options).configure({
  katexOptions: {
    throwOnError: false,
    displayMode: false,
  },
})

export const CustomBlockMathExtension = (options: EditorFnProps) => CustomBlockMath(options).configure({
  katexOptions: {
    throwOnError: false,
    displayMode: true,
  },
})
