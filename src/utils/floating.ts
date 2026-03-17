import { computePosition, flip, shift, Strategy } from "@floating-ui/dom"
import { Editor, posToDOMRect } from "@tiptap/core"

export const updatePosition = (editor: Editor, element: HTMLElement, strategy: Strategy = 'absolute') => {
  const virtualElement = {
    getBoundingClientRect: () => posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to),
  }

  computePosition(virtualElement, element, {
    placement: 'bottom-start',
    strategy,
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }: { x: number, y: number, strategy: string }) => {
    element.style.width = 'max-content'
    element.style.position = strategy
    element.style.left = `${x}px`
    element.style.top = `${y}px`
  })
}