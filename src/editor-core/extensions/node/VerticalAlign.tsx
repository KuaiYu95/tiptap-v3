import { Extension } from '@tiptap/core';

export interface VerticalAlignOptions {
  /**
   * The types where the vertical align attribute can be applied.
   * @default ['textStyle']
   * @example ['textStyle']
   */
  types: string[];
  /**
   * The alignments which are allowed.
   * @default ['top', 'middle', 'bottom']
   */
  alignments: string[];
  /**
   * The default alignment.
   * @default null
   */
  defaultAlignment: string | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    verticalAlign: {
      /**
       * Set the vertical align attribute
       * @param alignment The alignment
       * @example editor.commands.setVerticalAlign('top')
       */
      setVerticalAlign: (alignment: string) => ReturnType;
      /**
       * Unset the vertical align attribute
       * @example editor.commands.unsetVerticalAlign()
       */
      unsetVerticalAlign: () => ReturnType;
      /**
       * Toggle the vertical align attribute
       * @param alignment The alignment
       * @example editor.commands.toggleVerticalAlign('middle')
       */
      toggleVerticalAlign: (alignment: string) => ReturnType;
    };
  }
}

declare module '@tiptap/extension-text-style' {
  interface TextStyleAttributes {
    verticalAlign?: string | null;
  }
}

export const VerticalAlign = Extension.create<VerticalAlignOptions>({
  name: 'verticalAlign',

  addOptions() {
    return {
      types: ['textStyle'],
      alignments: ['top', 'middle', 'bottom'],
      defaultAlignment: null,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          verticalAlign: {
            default: this.options.defaultAlignment,
            parseHTML: (element) => {
              const alignment = element.style.verticalAlign;
              return this.options.alignments.includes(alignment)
                ? alignment
                : this.options.defaultAlignment;
            },
            renderHTML: (attributes) => {
              if (!attributes.verticalAlign) {
                return {};
              }
              return { style: `vertical-align: ${attributes.verticalAlign}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setVerticalAlign:
        (alignment) =>
          ({ commands }) => {
            if (!this.options.alignments.includes(alignment)) {
              return false;
            }
            return commands.toggleTextStyle({ verticalAlign: alignment });
          },
      unsetVerticalAlign:
        () =>
          ({ commands }) => {
            return commands.toggleTextStyle({ verticalAlign: null });
          },
      toggleVerticalAlign:
        (alignment) =>
          ({ editor, commands }) => {
            if (!this.options.alignments.includes(alignment)) {
              return false;
            }
            if (editor.isActive('textStyle', { verticalAlign: alignment })) {
              return commands.unsetVerticalAlign();
            }
            return commands.setVerticalAlign(alignment);
          },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-t': () => this.editor.commands.setVerticalAlign('top'),
      'Mod-Alt-m': () => this.editor.commands.setVerticalAlign('middle'),
      'Mod-Alt-b': () => this.editor.commands.setVerticalAlign('bottom'),
    };
  },
});

export default VerticalAlign;
