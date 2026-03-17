import { InputRule } from '@tiptap/core';
import HorizontalRule from "@tiptap/extension-horizontal-rule";

export const CustomHorizontalRule = HorizontalRule.extend({
  addInputRules() {
    const hrInputRule = new InputRule({
      find: /^(?:(?:-\s?){3,}|(?:\*\s?){3,}|(?:_\s?){3,})\s$/,
      handler: ({ state, range, chain }) => {
        if (range.from === 1) {
          return null
        }
        chain()
          .deleteRange(range)
          .setHorizontalRule()
          .run()
      },
    })

    return [hrInputRule]
  },
}).configure({
  HTMLAttributes: {
    class: 'custom-horizontal-rule',
  },
})
