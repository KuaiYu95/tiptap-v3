import { Editor } from '@tiptap/react';
import { Node } from '@tiptap/pm/model';
import { MenuItem } from '../../types';

export type CurrentNodeInfo = {
  label: string;
  color?: boolean;
  fontSize?: boolean;
  align?: boolean;
  convert?: boolean;
  download?: boolean;
} | null;

export type CurrentState = {
  editor: Editor;
  node: Node | null;
  pos: number;
};

export type ResourceState = {
  videos: Node[];
  audios: Node[];
  images: Node[];
  attachments: Node[];
};

export type DragHandleActionGroupId =
  | 'style'
  | 'convert'
  | 'download'
  | 'custom';

export type DragHandleActionGroup = {
  id: DragHandleActionGroupId;
  items: MenuItem[];
};
