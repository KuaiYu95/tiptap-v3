import { NODE_TYPE_LABEL, NodeTypeEnum } from '../../constants/enums';
import { Editor } from '@tiptap/react';
import { Node } from '@tiptap/pm/model';
import React from 'react';
import { filterResourcesByType, getAllResources, hasMarksInBlock } from '../../utils';
import { CurrentNodeInfo, CurrentState, ResourceState } from './types';

const createEmptyResources = (): ResourceState => ({
  videos: [],
  audios: [],
  images: [],
  attachments: [],
});

export const useCurrentNodeContext = (editor: Editor) => {
  const [current, setCurrent] = React.useState<CurrentState>({
    editor,
    node: null,
    pos: -1,
  });
  const [currentNode, setCurrentNode] = React.useState<CurrentNodeInfo>(null);
  const [resources, setResources] = React.useState<ResourceState>(createEmptyResources);
  const [hasMarks, setHasMarks] = React.useState(false);

  const isSameContext = React.useCallback((next: CurrentState) => {
    if (next.pos !== current.pos) {
      return false;
    }

    if (!next.node && !current.node) {
      return true;
    }

    if (!next.node || !current.node) {
      return false;
    }

    return next.node.eq(current.node);
  }, [current.node, current.pos]);

  const updateNodeChange = React.useCallback((data: CurrentState) => {
    if (isSameContext(data)) {
      return;
    }

    const allResources = data.node ? getAllResources(data.node) : [];
    setCurrent(data);
    setCurrentNode(data.node ? (NODE_TYPE_LABEL[data.node.type.name as keyof typeof NODE_TYPE_LABEL] ?? null) : null);
    setResources({
      videos: filterResourcesByType(allResources, [NodeTypeEnum.Video]),
      audios: filterResourcesByType(allResources, [NodeTypeEnum.Audio]),
      images: filterResourcesByType(allResources, [NodeTypeEnum.Image]),
      attachments: filterResourcesByType(allResources, [NodeTypeEnum.InlineAttachment, NodeTypeEnum.BlockAttachment]),
    });
    setHasMarks(data.node ? hasMarksInBlock(data.node) : false);
  }, [isSameContext]);

  React.useEffect(() => {
    const handleUpdate = () => {
      const { selection } = editor.state;

      let pos = selection.$head.pos;
      let node: Node | null = null;

      for (let depth = selection.$head.depth; depth >= 0; depth -= 1) {
        const blockNode = selection.$head.node(depth);
        if (blockNode && blockNode.isBlock) {
          node = blockNode;
          pos = selection.$head.before(depth + 1);
          break;
        }
      }

      if (!node) {
        node = editor.state.doc.firstChild;
        pos = 0;
      }

      if (node) {
        updateNodeChange({
          editor,
          node,
          pos,
        });
      }
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
      editor.off('transaction', handleUpdate);
    };
  }, [editor, updateNodeChange]);

  return {
    current,
    currentNode,
    resources,
    hasMarks,
    setCurrent,
    updateNodeChange,
  };
};
