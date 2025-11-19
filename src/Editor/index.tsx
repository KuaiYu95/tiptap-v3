import { EditorProps } from '@ctzhian/tiptap/type';
import { EditorContent } from '@tiptap/react';
import React from 'react';
import { PhotoProvider } from 'react-photo-view';
import CustomBubbleMenu from '../component/CustomBubbleMenu';
import CustomDragHandle from '../component/CustomDragHandle';

// fix: https://github.com/ueberdosis/tiptap/issues/6785
import 'core-js/actual/array/find-last';
import { TableHandle } from '../extension/component/Table';

const Editor = ({
  editor,
  menuInDragHandle,
  menuInBubbleMenu,
  onTip
}: EditorProps) => {
  return <PhotoProvider
    speed={() => 500}
    maskOpacity={0.3}
    toolbarRender={({ onScale, scale, rotate, onRotate }) => {
      return (
        <>
          <svg width="44" height="44" viewBox="0 0 768 768" className="PhotoView-Slider__toolbarIcon" onClick={() => onScale(scale + 1)}>
            <path d="M384 640.5q105 0 180.75-75.75t75.75-180.75-75.75-180.75-180.75-75.75-180.75 75.75-75.75 180.75 75.75 180.75 180.75 75.75zM384 64.5q132 0 225.75 93.75t93.75 225.75-93.75 225.75-225.75 93.75-225.75-93.75-93.75-225.75 93.75-225.75 225.75-93.75zM415.5 223.5v129h129v63h-129v129h-63v-129h-129v-63h129v-129h63z"></path>
          </svg>
          <svg width="44" height="44" viewBox="0 0 768 768" className="PhotoView-Slider__toolbarIcon" onClick={() => onScale(scale - 1)}>
            <path d="M384 640.5q105 0 180.75-75.75t75.75-180.75-75.75-180.75-180.75-75.75-180.75 75.75-75.75 180.75 75.75 180.75 180.75 75.75zM384 64.5q132 0 225.75 93.75t93.75 225.75-93.75 225.75-225.75 93.75-225.75-93.75-93.75-225.75 93.75-225.75 225.75-93.75zM223.5 352.5h321v63h-321v-63z"></path>
          </svg>
          <svg width="44" height="44" viewBox="0 0 768 768" className="PhotoView-Slider__toolbarIcon" onClick={() => onRotate(rotate + 90)}>
            <path d="M565.5 202.5l75-75v225h-225l103.5-103.5c-34.5-34.5-82.5-57-135-57-106.5 0-192 85.5-192 192s85.5 192 192 192c84 0 156-52.5 181.5-127.5h66c-28.5 111-127.5 192-247.5 192-141 0-255-115.5-255-256.5s114-256.5 255-256.5c70.5 0 135 28.5 181.5 75z"></path>
          </svg>
        </>
      );
    }}
  >
    <CustomBubbleMenu editor={editor} more={menuInBubbleMenu} />
    <CustomDragHandle editor={editor} more={menuInDragHandle} onTip={onTip} />
    <EditorContent editor={editor} />
    <TableHandle editor={editor} />
    {/* <TableSelectionOverlay editor={editor} /> */}
  </PhotoProvider>
};

export default Editor;