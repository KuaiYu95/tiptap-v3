import { Box, Stack, useTheme } from '@mui/material';
import DragHandleBase from '@tiptap/extension-drag-handle-react';
import type { Node } from '@tiptap/pm/model';
import { Editor } from '@tiptap/react';
import React from 'react';
import { AddLineIcon, ArrowDownSLineIcon, DraggableIcon } from '../../components/Icons';
import Menu from '../../components/Menu';
import { CUSTOM_DRAG_HANDLE_PLUGIN_KEY } from '../../editor-core/extensions/plugin-keys';
import { MenuItem, OnTipFunction } from '../../types';
import { buildDragHandleActionGroups, flattenDragHandleActionGroups } from './action-groups';
import DragHandleHeader from './drag-handle-header';
import { buildInsertActions } from './menu-builders';
import { canCurrentNodeIndent, getCurrentIndentLevel, selectCurrentNode } from './node-actions';
import { useCurrentNodeContext } from './use-current-node-context';

type StableDragHandleProps = {
  editor: Editor;
  pluginKey?: string;
  children: React.ReactNode;
  onNodeChange?: (data: { node: Node | null; editor: Editor; pos: number }) => void;
};

const DragHandle = DragHandleBase as React.ComponentType<StableDragHandleProps>;

const DragIcon = ({ onClick }: { onClick?: () => void }) => <Box onClick={onClick} sx={{
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: '0.25rem',
  border: '1px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'text.tertiary',
  cursor: 'grab',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    color: 'text.secondary',
    bgcolor: 'divider',
  },
  '&:active': {
    color: 'text.primary',
    cursor: 'grabbing',
  },
}}>
  <DraggableIcon sx={{ fontSize: '1.25rem' }} />
</Box>

const AddIcon = ({ onClick }: { onClick?: (event: React.MouseEvent<HTMLDivElement>) => void }) => <Box onClick={onClick} sx={{
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: '0.25rem',
  border: '1px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'text.tertiary',
  cursor: 'grab',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    color: 'text.secondary',
    bgcolor: 'divider',
  },
  '&:active': {
    color: 'text.primary',
    cursor: 'grabbing',
  },
}}>
  <AddLineIcon sx={{ fontSize: '1.25rem' }} />
</Box>

const setDragHandleLocked = (editor: Editor, locked: boolean) => {
  editor.view.dispatch(editor.state.tr.setMeta('lockDragHandle', locked));
};

const CustomDragHandle = ({ editor, more, onTip }: { editor: Editor, more?: MenuItem[], onTip?: OnTipFunction }) => {
  const theme = useTheme()
  const [isHandleHovered, setIsHandleHovered] = React.useState(false);
  const [isInsertMenuOpen, setIsInsertMenuOpen] = React.useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = React.useState(false);
  const {
    current,
    currentNode,
    resources,
    hasMarks,
    setCurrent,
    updateNodeChange,
  } = useCurrentNodeContext(editor)

  const actionGroups = React.useMemo(() => buildDragHandleActionGroups({
    current,
    currentNode,
    resources,
    theme,
    more,
  }), [current, currentNode, resources, theme, more]);

  const shouldLockDragHandle = isHandleHovered || isInsertMenuOpen || isActionMenuOpen;

  React.useEffect(() => {
    setDragHandleLocked(editor, shouldLockDragHandle);

    return () => {
      setDragHandleLocked(editor, false);
    };
  }, [editor, shouldLockDragHandle]);

  return <DragHandle
    editor={editor}
    pluginKey={CUSTOM_DRAG_HANDLE_PLUGIN_KEY}
    onNodeChange={updateNodeChange}
  >
    <Stack
      direction={'row'}
      alignItems={'center'}
      gap={1}
      sx={{ mr: 1, height: '1.625rem' }}
      onMouseEnter={() => setIsHandleHovered(true)}
      onMouseLeave={() => setIsHandleHovered(false)}
    >
      <Menu
        context={<AddIcon />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        arrowIcon={<ArrowDownSLineIcon sx={{ fontSize: '1rem', transform: 'rotate(-90deg)' }} />}
        list={buildInsertActions(current)}
        onOpen={() => setIsInsertMenuOpen(true)}
        onClose={() => setIsInsertMenuOpen(false)}
      />
      {currentNode ? <Menu
        width={216}
        context={<DragIcon />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        arrowIcon={<ArrowDownSLineIcon sx={{ fontSize: '1rem', transform: 'rotate(-90deg)' }} />}
        header={
          <DragHandleHeader
            editor={editor}
            current={current}
            currentNode={currentNode}
            hasMarks={hasMarks}
            canCurrentNodeIndent={() => canCurrentNodeIndent(current)}
            getCurrentIndentLevel={() => getCurrentIndentLevel(current)}
            selectCurrentNode={() => selectCurrentNode(current)}
            setCurrent={setCurrent}
            onTip={onTip}
          />
        }
        list={flattenDragHandleActionGroups(actionGroups)}
        onOpen={() => setIsActionMenuOpen(true)}
        onClose={() => setIsActionMenuOpen(false)}
      /> : <DragIcon />}
    </Stack>
  </DragHandle>
}

export default CustomDragHandle;
