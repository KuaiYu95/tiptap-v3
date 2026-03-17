import { DeleteLineIcon, EraserLineIcon, FileCopyLineIcon, IndentDecreaseIcon, IndentIncreaseIcon, ScissorsCutLineIcon } from '../../components/Icons';
import { OnTipFunction } from '../../types';
import { Divider, Stack, Typography } from '@mui/material';
import { Fragment, Slice } from '@tiptap/pm/model';
import { Editor } from '@tiptap/react';
import React from 'react';
import { ToolbarItem } from '../../components/Toolbar';
import { withNodeTextSelection } from './menu-shared';
import { CurrentNodeInfo, CurrentState } from './types';

interface DragHandleHeaderProps {
  editor: Editor;
  current: CurrentState;
  currentNode: CurrentNodeInfo;
  hasMarks: boolean;
  canCurrentNodeIndent: () => boolean;
  getCurrentIndentLevel: () => number;
  selectCurrentNode: () => void;
  setCurrent: React.Dispatch<React.SetStateAction<CurrentState>>;
  onTip?: OnTipFunction;
}

const writeNodeToClipboard = async (editor: Editor, current: CurrentState) => {
  if (!current.node) {
    return;
  }

  const content = new Slice(Fragment.from(current.node), 0, 0);
  const textContent = current.node.textContent;
  const htmlContent = editor.view.serializeForClipboard(content).dom.innerHTML;

  try {
    if (htmlContent && navigator.clipboard && 'write' in navigator.clipboard) {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({ 'text/html': blob });
      await navigator.clipboard.write([clipboardItem]);
      return;
    }
  } catch {
  }

  await navigator.clipboard.writeText(textContent);
};

const DragHandleHeader = ({
  editor,
  current,
  currentNode,
  hasMarks,
  canCurrentNodeIndent,
  getCurrentIndentLevel,
  selectCurrentNode,
  setCurrent,
  onTip,
}: DragHandleHeaderProps) => {
  return (
    <>
      <Typography sx={{ p: 1, fontSize: '0.75rem', color: 'text.secondary', fontWeight: 'bold' }}>
        {currentNode?.label}
      </Typography>
      <Stack direction="row" flexWrap="wrap" sx={{ fontSize: 14 }}>
        <ToolbarItem
          key="indent-decrease"
          onClick={() => {
            if (!canCurrentNodeIndent()) return;
            selectCurrentNode();
            current.editor.chain().focus().decreaseIndent().run();
            setCurrent((prev) => ({ ...prev }));
          }}
          icon={<IndentDecreaseIcon sx={{ fontSize: '1rem' }} />}
          tip="减少缩进"
          disabled={getCurrentIndentLevel() <= 0}
        />
        <ToolbarItem
          key="indent-increase"
          onClick={() => {
            if (!canCurrentNodeIndent()) return;
            selectCurrentNode();
            current.editor.chain().focus().increaseIndent().run();
            setCurrent((prev) => ({ ...prev }));
          }}
          icon={<IndentIncreaseIcon sx={{ fontSize: '1rem' }} />}
          tip="增加缩进"
          disabled={!canCurrentNodeIndent()}
        />
        <ToolbarItem
          key="format"
          disabled={!hasMarks}
          onClick={() => {
            withNodeTextSelection(current, (from, to) => {
              current.editor.chain().focus().setTextSelection({ from, to }).unsetAllMarks().run();
            });
          }}
          icon={<EraserLineIcon sx={{ fontSize: '1rem' }} />}
          tip="清除格式"
        />
        <ToolbarItem
          key="copy"
          onClick={async () => {
            if (!current.node || current.pos === undefined) return;
            try {
              await writeNodeToClipboard(editor, current);
            } catch {
              onTip?.('error', '复制失败');
            }
          }}
          icon={<FileCopyLineIcon sx={{ fontSize: '1rem' }} />}
          tip={`复制${currentNode?.label}`}
        />
        <ToolbarItem
          key="cut"
          onClick={async () => {
            if (!current.node || current.pos === undefined) return;
            try {
              await writeNodeToClipboard(editor, current);
              current.editor.chain().focus().deleteRange({ from: current.pos, to: current.pos + current.node.nodeSize }).run();
            } catch {
              onTip?.('error', '剪切失败');
            }
          }}
          icon={<ScissorsCutLineIcon sx={{ fontSize: '1rem' }} />}
          tip={`剪切${currentNode?.label}`}
        />
        <ToolbarItem
          key="delete"
          onClick={() => {
            if (current.node && current.pos !== undefined) {
              current.editor.chain().focus().deleteRange({ from: current.pos, to: current.pos + current.node.nodeSize }).run();
            }
          }}
          icon={<DeleteLineIcon sx={{ fontSize: '1rem' }} />}
          tip={`删除${currentNode?.label}`}
        />
      </Stack>
      <Divider sx={{ my: 0.5 }} />
    </>
  );
};

export default DragHandleHeader;
