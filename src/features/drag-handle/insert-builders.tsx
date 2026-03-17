import React from 'react';
import { TextWrapIcon } from '../../components/Icons';
import { NodeTypeEnum } from '../../constants/enums';
import { MenuItem } from '../../types';
import { CurrentState } from './types';

const createInsertContent = (current: CurrentState) => {
  if (!current.node) {
    return { type: 'paragraph', content: [{ type: 'text', text: '/' }] };
  }

  if (current.node.type.name === NodeTypeEnum.TaskItem) {
    return {
      type: 'taskItem',
      attrs: { checked: false },
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '/' }],
        },
      ],
    };
  }

  if (current.node.type.name === NodeTypeEnum.ListItem) {
    return {
      type: 'listItem',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '/' }],
        },
      ],
    };
  }

  return { type: 'paragraph', content: [{ type: 'text', text: '/' }] };
};

export const buildInsertActions = (current: CurrentState): MenuItem[] => ([
  {
    label: '上方插入行',
    key: 'insert-line-break-top',
    icon: <TextWrapIcon sx={{ fontSize: '1rem', transform: 'rotate(180deg)' }} />,
    onClick: () => {
      if (current.node && current.pos !== undefined) {
        current.editor.chain().focus().insertContentAt(
          current.pos,
          createInsertContent(current),
          { updateSelection: true },
        ).run();
      }
    },
  },
  {
    label: '下方插入行',
    key: 'insert-line-break',
    icon: <TextWrapIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => {
      if (current.node && current.pos !== undefined) {
        const afterPos = current.pos + current.node.nodeSize;
        current.editor.chain().focus().insertContentAt(afterPos, createInsertContent(current)).run();
      }
    },
  },
]);
