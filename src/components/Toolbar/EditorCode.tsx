import { Editor } from "@tiptap/react";
import React from "react";
import { CodeBoxLineIcon, CodeLineIcon, CodeSSlashLineIcon } from "../Icons";
import EditorCommandSelect, { useEditorSelectValue } from "./CommandSelect";

interface EditorCodeProps {
  editor: Editor;
}

const EditorCode = ({ editor }: EditorCodeProps) => {
  const codeOptions = [
    { id: 'code', icon: <CodeLineIcon sx={{ fontSize: '1rem' }} />, label: '行内代码', shortcutKey: ['ctrl', 'E'] },
    { id: 'codeBlock', icon: <CodeBoxLineIcon sx={{ fontSize: '1rem' }} />, label: '代码块', shortcutKey: ['ctrl', 'alt', 'C'] },
  ];
  const selectedValue = useEditorSelectValue(editor, React.useCallback(() => {
    if (editor.isActive('code')) return 'code';
    if (editor.isActive('codeBlock')) return 'codeBlock';
    return 'none';
  }, [editor]));

  return (
    <EditorCommandSelect
      editor={editor}
      value={selectedValue}
      activeValues={['code', 'codeBlock']}
      options={codeOptions}
      tip="代码"
      fallbackIcon={<CodeSSlashLineIcon sx={{ fontSize: '1rem' }} />}
      onSelect={(value) => {
        if (value === 'code') {
          editor.chain().focus().toggleCode().run();
        } else if (value === 'codeBlock') {
          editor.chain().focus().toggleCodeBlock().run();
        }
      }}
    />
  );
};

export default EditorCode;
