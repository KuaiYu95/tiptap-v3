import { Editor } from "@tiptap/react";
import React from "react";
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from "../Icons";
import EditorCommandSelect, { useEditorSelectValue } from "./CommandSelect";

interface EditorAlignSelectProps {
  editor: Editor;
}

const EditorAlignSelect = ({ editor }: EditorAlignSelectProps) => {
  const alignOptions = [
    { id: 'left', icon: <AlignLeftIcon sx={{ fontSize: '1rem' }} />, label: '左侧对齐', shortcutKey: ['ctrl', 'shift', 'L'] },
    { id: 'center', icon: <AlignCenterIcon sx={{ fontSize: '1rem' }} />, label: '居中对齐', shortcutKey: ['ctrl', 'shift', 'E'] },
    { id: 'right', icon: <AlignRightIcon sx={{ fontSize: '1rem' }} />, label: '右侧对齐', shortcutKey: ['ctrl', 'shift', 'R'] },
    { id: 'justify', icon: <AlignJustifyIcon sx={{ fontSize: '1rem' }} />, label: '两端对齐', shortcutKey: ['ctrl', 'shift', 'J'] },
  ];
  const selectedValue = useEditorSelectValue(editor, React.useCallback(() => {
    if (editor.isActive({ textAlign: 'left' })) return 'left';
    if (editor.isActive({ textAlign: 'center' })) return 'center';
    if (editor.isActive({ textAlign: 'right' })) return 'right';
    if (editor.isActive({ textAlign: 'justify' })) return 'justify';
    return 'none';
  }, [editor]));

  return (
    <EditorCommandSelect
      editor={editor}
      value={selectedValue}
      activeValues={['left', 'center', 'right', 'justify']}
      options={alignOptions}
      tip="对齐方式"
      fallbackIcon={<AlignLeftIcon sx={{ fontSize: '1rem' }} />}
      onSelect={(value) => {
        if (value !== 'none') {
          editor.chain().focus().toggleTextAlign(value).run();
        }
      }}
    />
  );
}

export default EditorAlignSelect;
