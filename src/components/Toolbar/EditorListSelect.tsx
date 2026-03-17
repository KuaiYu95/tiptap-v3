import { Editor } from "@tiptap/react";
import React from "react";
import { ListCheck3Icon, ListOrdered2Icon, ListUnorderedIcon } from "../Icons";
import EditorCommandSelect, { useEditorSelectValue } from "./CommandSelect";

interface EditorListSelectProps {
  editor: Editor;
}

const EditorListSelect = ({ editor }: EditorListSelectProps) => {
  const listOptions = [
    { id: 'orderedList', icon: <ListOrdered2Icon sx={{ fontSize: '1rem' }} />, label: '有序列表', shortcutKey: ['ctrl', 'shift', '7'] },
    { id: 'bulletList', icon: <ListUnorderedIcon sx={{ fontSize: '1rem' }} />, label: '无序列表', shortcutKey: ['ctrl', 'shift', '8'] },
    { id: 'taskList', icon: <ListCheck3Icon sx={{ fontSize: '1rem' }} />, label: '待办列表', shortcutKey: ['ctrl', 'shift', '9'] },
  ];
  const selectedValue = useEditorSelectValue(editor, React.useCallback(() => {
    if (editor.isActive('orderedList')) return 'orderedList';
    if (editor.isActive('bulletList')) return 'bulletList';
    if (editor.isActive('taskList')) return 'taskList';
    return 'none';
  }, [editor]));

  return (
    <EditorCommandSelect
      editor={editor}
      value={selectedValue}
      activeValues={['orderedList', 'taskList', 'bulletList']}
      options={listOptions}
      tip="列表"
      fallbackIcon={<ListUnorderedIcon sx={{ fontSize: '1rem' }} />}
      onSelect={(value) => {
        if (value === 'orderedList') {
          editor.chain().focus().toggleOrderedList().run();
        } else if (value === 'taskList') {
          editor.chain().focus().toggleTaskList().run();
        } else if (value === 'bulletList') {
          editor.chain().focus().toggleBulletList().run();
        }
      }}
    />
  );
}

export default EditorListSelect;
