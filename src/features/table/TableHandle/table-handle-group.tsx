import type { Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/react';
import React from 'react';
import type { Orientation } from '../../../utils/table';
import { TableHandleAddButton } from './TableHandleAddButton';
import { TableHandleMenu } from './TableHandleMenu';

interface TableHandleGroupProps {
  editor: Editor;
  orientation: Orientation;
  index?: number;
  tablePos?: number;
  tableNode?: Node;
  onToggleOtherHandle?: (visible: boolean) => void;
  onOpenChange?: (open: boolean) => void;
  dragStart?: (e: React.DragEvent) => void;
}

export function TableHandleGroup({
  editor,
  orientation,
  index,
  tablePos,
  tableNode,
  onToggleOtherHandle,
  onOpenChange,
  dragStart,
}: TableHandleGroupProps) {
  if (orientation === 'row') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.125rem',
          width: '0.75rem',
          height: 'var(--table-handle-ref-height, 40px)',
        }}
      >
        <TableHandleAddButton
          editor={editor}
          orientation="row"
          index={index}
          tablePos={tablePos}
          tableNode={tableNode}
          direction="before"
        />
        <TableHandleMenu
          editor={editor}
          orientation="row"
          index={index}
          tablePos={tablePos}
          tableNode={tableNode}
          onToggleOtherHandle={onToggleOtherHandle}
          dragStart={dragStart}
          onOpenChange={onOpenChange}
        />
        <TableHandleAddButton
          editor={editor}
          orientation="row"
          index={index}
          tablePos={tablePos}
          tableNode={tableNode}
          direction="after"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '0.125rem',
        height: '0.75rem',
        width: 'var(--table-handle-ref-width, 100px)',
      }}
    >
      <TableHandleAddButton
        editor={editor}
        orientation="column"
        index={index}
        tablePos={tablePos}
        tableNode={tableNode}
        direction="before"
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <TableHandleMenu
          editor={editor}
          orientation="column"
          index={index}
          tablePos={tablePos}
          tableNode={tableNode}
          onToggleOtherHandle={onToggleOtherHandle}
          dragStart={dragStart}
          onOpenChange={onOpenChange}
        />
      </div>
      <TableHandleAddButton
        editor={editor}
        orientation="column"
        index={index}
        tablePos={tablePos}
        tableNode={tableNode}
        direction="after"
      />
    </div>
  );
}
