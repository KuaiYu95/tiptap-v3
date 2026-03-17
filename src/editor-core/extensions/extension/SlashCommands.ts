import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { slashSuggestion } from '../suggestion/slash'

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        // startOfLine: true,
        ...slashSuggestion()
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

export default SlashCommands
