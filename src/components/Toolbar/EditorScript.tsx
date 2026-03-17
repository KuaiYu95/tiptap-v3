import { Editor } from "@tiptap/react";
import React from "react";
import { SubscriptIcon, SuperscriptIcon } from "../Icons";
import EditorCommandSelect, { useEditorSelectValue } from "./CommandSelect";

interface EditorScriptProps {
  editor: Editor;
}

const EditorScript = ({ editor }: EditorScriptProps) => {
  const scriptOptions = [
    { id: 'superscript', icon: <SuperscriptIcon sx={{ fontSize: '1rem' }} />, label: '上标', shortcutKey: ['ctrl', '.'] },
    { id: 'subscript', icon: <SubscriptIcon sx={{ fontSize: '1rem' }} />, label: '下标', shortcutKey: ['ctrl', ','] },
  ];
  const selectedValue = useEditorSelectValue(editor, React.useCallback(() => {
    if (editor.isActive('superscript')) return 'superscript';
    if (editor.isActive('subscript')) return 'subscript';
    return 'none';
  }, [editor]));

  return (
    <EditorCommandSelect
      editor={editor}
      value={selectedValue}
      activeValues={['superscript', 'subscript']}
      options={scriptOptions}
      tip="上标/下标"
      fallbackIcon={<SuperscriptIcon sx={{ fontSize: '1rem' }} />}
      onSelect={(value) => {
        if (value === 'superscript') {
          editor.chain().focus().toggleSuperscript().run();
        } else if (value === 'subscript') {
          editor.chain().focus().toggleSubscript().run();
        }
      }}
    />
  );
}

export default EditorScript;
