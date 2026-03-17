import {
  H1Icon,
  H2Icon,
  H3Icon,
  Information2LineIcon,
  ListCheck3Icon,
  ListOrdered2Icon,
  ListUnorderedIcon,
  QuoteTextIcon,
  Repeat2LineIcon,
  TextIcon,
} from '../../components/Icons';
import { NodeTypeEnum } from '../../constants/enums';
import { MenuItem } from '../../types';
import { Divider } from '@mui/material';
import React from 'react';
import type { AlertType, AlertVariant } from '../../editor-core/extensions/node/Alert';
import { convertNodeAt } from '../../utils';
import { LinewiseTarget } from '../../utils/linewiseConvert';
import { GROUP_TYPES } from './menu-shared';
import { CurrentNodeInfo, CurrentState } from './types';

const buildConvertActionItems = (
  current: CurrentState,
  convertGroupedNode: (target: LinewiseTarget) => void,
): MenuItem[] => ([
  {
    label: '文本',
    selected: current.node?.type.name === 'paragraph',
    key: 'convert-to-paragraph',
    icon: <TextIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => convertGroupedNode({ type: 'paragraph' }),
  },
  {
    label: '标题1',
    selected: current.node?.type.name === 'heading' && current.node?.attrs.level === 1,
    key: 'convert-to-heading-1',
    icon: <H1Icon sx={{ fontSize: '1rem' }} />,
    onClick: () => convertGroupedNode({ type: 'heading', level: 1 }),
  },
  {
    label: '标题2',
    selected: current.node?.type.name === 'heading' && current.node?.attrs.level === 2,
    key: 'convert-to-heading-2',
    icon: <H2Icon sx={{ fontSize: '1rem' }} />,
    onClick: () => convertGroupedNode({ type: 'heading', level: 2 }),
  },
  {
    label: '标题3',
    selected: current.node?.type.name === 'heading' && current.node?.attrs.level === 3,
    key: 'convert-to-heading-3',
    icon: <H3Icon sx={{ fontSize: '1rem' }} />,
    onClick: () => convertGroupedNode({ type: 'heading', level: 3 }),
  },
  {
    customLabel: <Divider sx={{ my: 0.5 }} />,
    key: 'divider2',
  },
  {
    label: '有序列表',
    selected: current.node?.type.name === 'orderedList',
    key: 'convert-to-ordered-list',
    icon: <ListOrdered2Icon sx={{ fontSize: '1rem' }} />,
    onClick: () => convertGroupedNode({ type: 'orderedList' }),
  },
  {
    label: '无序列表',
    selected: current.node?.type.name === 'bulletList',
    key: 'convert-to-bullet-list',
    icon: <ListUnorderedIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => convertGroupedNode({ type: 'bulletList' }),
  },
  {
    label: '任务列表',
    selected: current.node?.type.name === 'taskList',
    key: 'convert-to-task-list',
    icon: <ListCheck3Icon sx={{ fontSize: '1rem' }} />,
    onClick: () => convertGroupedNode({ type: 'taskList' }),
  },
  {
    customLabel: <Divider sx={{ my: 0.5 }} />,
    key: 'divider3',
  },
  {
    label: '引用',
    selected: current.node?.type.name === 'blockquote',
    key: 'convert-to-blockquote',
    icon: <QuoteTextIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => convertGroupedNode({ type: 'blockquote' }),
  },
  {
    label: '警告块',
    selected: current.node?.type.name === 'alert',
    key: 'convert-to-alert',
    icon: <Information2LineIcon sx={{ fontSize: '1rem' }} />,
    onClick: () => convertGroupedNode({ type: 'alert', attrs: { variant: 'info', type: 'icon' } }),
  },
]);

export const buildConvertActions = ({
  current,
  currentNode,
  selectCurrentNode,
  cancelNodeType,
}: {
  current: CurrentState;
  currentNode: CurrentNodeInfo;
  selectCurrentNode: () => void;
  cancelNodeType: () => void;
}): MenuItem[] => {
  if (!currentNode?.convert) {
    return [];
  }

  const convertGroupedNode = (target: LinewiseTarget) => {
    if (!current.node) return;
    const type = current.node.type.name as NodeTypeEnum;
    if (GROUP_TYPES.includes(type)) {
      convertNodeAt(current.editor, current.pos, current.node as any, target);
      return;
    }
    selectCurrentNode();
    cancelNodeType();
    if (target.type === 'paragraph') current.editor.commands.setParagraph();
    if (target.type === 'heading' && target.level) current.editor.commands.setHeading({ level: target.level });
    if (target.type === 'orderedList') current.editor.commands.toggleOrderedList();
    if (target.type === 'bulletList') current.editor.commands.toggleBulletList();
    if (target.type === 'taskList') current.editor.commands.toggleTaskList();
    if (target.type === 'blockquote') current.editor.commands.toggleBlockquote();
    if (target.type === 'alert') {
      current.editor.commands.toggleAlert(
        (target.attrs || { type: 'icon', variant: 'info' }) as {
          type?: AlertType;
          variant?: AlertVariant;
        },
      );
    }
  };

  return [{
    label: '转换',
    key: 'convert',
    width: 160,
    maxHeight: 400,
    icon: <Repeat2LineIcon sx={{ fontSize: '1rem' }} />,
    children: buildConvertActionItems(current, convertGroupedNode),
  }];
};
