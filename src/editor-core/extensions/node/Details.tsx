import Details, { DetailsContent, DetailsSummary } from "@tiptap/extension-details";

const CustomDetails = Details.extend({
  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: (element: HTMLElement) => element.hasAttribute('open'),
        renderHTML: ({ open }: { open: boolean }) => {
          if (!open) {
            return {}
          }
          return { open: '' }
        },
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-8': () => {
        return this.editor.chain().focus().setDetails().run()
      }
    }
  },
})

export const DetailsExtension = CustomDetails.configure({
  persist: true,
  openClassName: 'is-open',
  HTMLAttributes: {
    class: 'cq-details',
  },
});

export const DetailsSummaryExtension = DetailsSummary.configure({
  HTMLAttributes: {
    class: 'cq-details-summary',
  },
});

export const DetailsContentExtension = DetailsContent.configure({
  HTMLAttributes: {
    class: 'cq-details-content',
  },
});