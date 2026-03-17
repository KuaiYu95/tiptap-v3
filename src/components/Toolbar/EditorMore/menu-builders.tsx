import React from 'react';
import { CommandLineIcon } from '../../Icons';
import { ToolbarItemType } from '../../../types';

export interface EditorMoreMenuOption extends ToolbarItemType {
  onClick?: () => void;
}

export const buildEditorMoreOptions = (): EditorMoreMenuOption[] => ([
  {
    id: 'notification',
    icon: <CommandLineIcon sx={{ fontSize: '1rem' }} />,
    label: '查看快捷键',
  },
]);

