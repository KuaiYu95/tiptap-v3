import { NodeTypeEnum } from '../../constants/enums';
import { NodeSelection } from '@tiptap/pm/state';
import { CurrentState } from './types';

export const cancelNodeType = (current: CurrentState) => {
  const type = current.node?.type.name;

  switch (type) {
    case NodeTypeEnum.Paragraph:
    case NodeTypeEnum.Heading:
    case NodeTypeEnum.ListItem:
    case NodeTypeEnum.TaskItem:
    case NodeTypeEnum.Alert:
      current.editor.commands.setParagraph();
      break;
    case NodeTypeEnum.BulletList:
      current.editor.commands.toggleBulletList();
      break;
    case NodeTypeEnum.OrderedList:
      current.editor.commands.toggleOrderedList();
      break;
    case NodeTypeEnum.TaskList:
      current.editor.commands.toggleTaskList();
      break;
    case NodeTypeEnum.Blockquote:
      current.editor.commands.toggleBlockquote();
      break;
    case NodeTypeEnum.CodeBlock:
      current.editor.commands.toggleCodeBlock();
      break;
    default:
      break;
  }
};

export const selectCurrentNode = (current: CurrentState) => {
  const { state, view } = current.editor;
  const tr = state.tr;
  const pos = current.pos;

  if (pos < 0) {
    return;
  }

  const selection = NodeSelection.create(tr.doc as any, pos);
  tr.setSelection(selection);
  view.dispatch(tr);
  view.focus();
};

export const canCurrentNodeIndent = (current: CurrentState): boolean => {
  return !!(current.node && (current.node as any).type);
};

export const getCurrentIndentLevel = (current: CurrentState): number => {
  if (!canCurrentNodeIndent(current)) {
    return 0;
  }

  const node = current.node as any;
  const attrs = current.editor.getAttributes(node.type.name) as Record<string, any>;
  return Number(attrs.indent) || 0;
};
