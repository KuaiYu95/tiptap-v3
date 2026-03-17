import { EditorProps } from '../../../types';
import { EditorContent } from '@tiptap/react';
import React from 'react';
import CustomBubbleMenu from '../../../components/CustomBubbleMenu';
import CustomDragHandle from '../../../features/drag-handle';
import { ImageViewerProvider } from '../../../components/ImageViewer';
import { TableCellHandleMenu } from '../../../features/table/TableCellHandleMenu';
import { TableExtendRowColumnButtons } from '../../../features/table/TableExtendButton';
import { TableHandle } from '../../../features/table/TableHandle';
import { TableSelectionOverlay } from '../../../features/table/TableSelectionOverlay';

// fix: https://github.com/ueberdosis/tiptap/issues/6785
import 'core-js/actual/array/find-last';

const Editor = ({
  editor,
  menuInDragHandle,
  menuInBubbleMenu,
  onTip
}: EditorProps) => {
  const isEditable = editor.isEditable;

  return <ImageViewerProvider
    speed={500}
    maskOpacity={0.3}
  >
    <CustomBubbleMenu editor={editor} more={menuInBubbleMenu} />
    <CustomDragHandle editor={editor} more={menuInDragHandle} onTip={onTip} />
    <EditorContent editor={editor} />
    {isEditable && (
      <>
        <TableHandle editor={editor} />
        <TableExtendRowColumnButtons editor={editor} />
        <TableSelectionOverlay
          editor={editor}
          showResizeHandles={true}
          cellMenu={(props) => (
            <TableCellHandleMenu
              editor={props.editor}
              onResizeStart={props.onResizeStart}
            />
          )}
        />
      </>
    )}
  </ImageViewerProvider>
};

export default Editor;
