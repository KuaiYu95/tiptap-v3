import { Editor } from "@tiptap/react";
import React from "react";
import { FormulaIcon, FunctionsIcon, SquareRootIcon } from "../Icons";
import EditorCommandSelect, { useEditorSelectValue } from "./CommandSelect";

interface EditorMathProps {
  editor: Editor
}

const EditorMath = ({ editor }: EditorMathProps) => {
  const mathOptions = [
    { id: 'inline-math', icon: <SquareRootIcon sx={{ fontSize: '1rem' }} />, label: '行内公式', shortcutKey: ['ctrl', '6'] },
    { id: 'block-math', icon: <FunctionsIcon sx={{ fontSize: '1rem' }} />, label: '块级公式', shortcutKey: ['ctrl', '7'] },
  ];
  const selectedValue = useEditorSelectValue(editor, React.useCallback(() => {
    if (editor.isActive('inlineMath')) return 'inline-math';
    if (editor.isActive('blockMath')) return 'block-math';
    return 'none';
  }, [editor]));

  return (
    <EditorCommandSelect
      editor={editor}
      value={selectedValue}
      activeValues={['inline-math', 'block-math']}
      options={mathOptions}
      tip="LaTeX 数学公式"
      fallbackIcon={<FormulaIcon sx={{ fontSize: '1rem' }} />}
      onSelect={(value) => {
        if (value === 'inline-math') {
          editor.commands.setInlineMath({ latex: '' });
        } else if (value === 'block-math') {
          editor.commands.setBlockMath({ latex: '' });
        }
      }}
    />
  );
}

export default EditorMath
