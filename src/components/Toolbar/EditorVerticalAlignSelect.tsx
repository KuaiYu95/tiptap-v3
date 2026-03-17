import { Editor } from "@tiptap/react";
import React from "react";
import { AlignBottomIcon, AlignTopIcon, AlignVerticallyIcon } from "../Icons";
import EditorCommandSelect, { useEditorSelectValue } from "./CommandSelect";

interface EditorVerticalAlignSelectProps {
  editor: Editor;
}

const EditorVerticalAlignSelect = ({ editor }: EditorVerticalAlignSelectProps) => {
  const verticalAlignOptions = [
    { id: 'top', icon: <AlignTopIcon sx={{ fontSize: '1rem' }} />, label: '顶部对齐', shortcutKey: ['ctrl', 'alt', 'T'] },
    { id: 'middle', icon: <AlignVerticallyIcon sx={{ fontSize: '1rem' }} />, label: '中间对齐', shortcutKey: ['ctrl', 'alt', 'M'] },
    { id: 'bottom', icon: <AlignBottomIcon sx={{ fontSize: '1rem' }} />, label: '底部对齐', shortcutKey: ['ctrl', 'alt', 'B'] },
  ];
  const selectedValue = useEditorSelectValue(editor, React.useCallback(() => {
    if (editor.isActive('textStyle', { verticalAlign: 'top' })) return 'top';
    if (editor.isActive('textStyle', { verticalAlign: 'middle' })) return 'middle';
    if (editor.isActive('textStyle', { verticalAlign: 'bottom' })) return 'bottom';
    return 'none';
  }, [editor]));

  return (
    <EditorCommandSelect
      editor={editor}
      value={selectedValue}
      activeValues={['top', 'middle', 'bottom']}
      options={verticalAlignOptions}
      tip="垂直对齐方式"
      fallbackIcon={<AlignVerticallyIcon sx={{ fontSize: '1rem' }} />}
      onSelect={(value) => {
        if (value !== 'none') {
          editor.chain().focus().toggleVerticalAlign(value).run();
        }
      }}
    />
  );
}

export default EditorVerticalAlignSelect;
