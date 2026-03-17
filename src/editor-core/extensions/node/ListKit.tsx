import { ListKit } from '@tiptap/extension-list';
import { LIST_HTML_ATTRIBUTES } from './list-shared';

export const ListExtension = ListKit.configure({
  orderedList: {
    HTMLAttributes: LIST_HTML_ATTRIBUTES.orderedList,
  },
  bulletList: {
    HTMLAttributes: LIST_HTML_ATTRIBUTES.bulletList,
  },
  taskList: {
    HTMLAttributes: LIST_HTML_ATTRIBUTES.taskList,
  },
  taskItem: {
    nested: true,
    HTMLAttributes: LIST_HTML_ATTRIBUTES.taskItem,
  },
})

export default ListExtension
