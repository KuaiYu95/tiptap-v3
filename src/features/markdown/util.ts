import AceEditor from "react-ace";

export const insertBlockTool = (ace: AceEditor, options: {
  text: string;
  position?: number;
  row?: number;
  wrap?: boolean
}) => {
  if (!ace || !ace.editor) return;
  const cursor = ace.editor.getCursorPosition();
  const curRowLength = ace.editor.session.getLine(cursor.row).length;
  const prevRowLength = ace.editor.session.getLine(cursor.row - 1).length;
  let text = `\n\n${options.text}`;
  let plusRow = 2;
  if (curRowLength === 0 && (prevRowLength === 0 && cursor.row > 1)) {
    text = `${options.text}`;
    if (options.wrap) {
      plusRow = 0;
    }
  }
  if (curRowLength === 0 && cursor.row === 0) {
    text = options.text;
    if (options.wrap) {
      plusRow = 0;
    }
  }
  if (curRowLength === 0 && prevRowLength > 0) {
    text = `\n${options.text}`;
    if (options.wrap) {
      plusRow = 1;
    }
  }
  ace.editor.moveCursorTo(cursor.row, curRowLength)
  ace.editor.clearSelection();
  ace.editor.insert(text);
  ace.editor.moveCursorTo(cursor.row + plusRow + (options.row || 0), options.position || 0);
  ace.editor.focus();
}

export const insertInlineTool = (ace: AceEditor, options: {
  single?: string;
  left?: string;
  right?: string;
  position?: number;
  row?: number;
}) => {
  if (!ace || !ace.editor) return;

  const left = options.single || options.left || ''
  const right = options.single || options.right || ''

  const selectedText = ace.editor.getSelectedText();
  const cursor = ace.editor.getCursorPosition();
  const selectionRange = ace.editor.getSelectionRange();

  if (selectedText) {
    const wrappedText = `${left}${selectedText}${right}`;
    ace.editor.insert(wrappedText);
    const startRow = selectionRange.start.row;
    const startColumn = selectionRange.start.column;
    const endRow = selectionRange.end.row;
    const endColumn = selectionRange.end.column;
    ace.editor.moveCursorTo(startRow, startColumn);
    ace.editor.selection.selectTo(endRow, endColumn + left.length + right.length);
  } else {
    const { position = 0, row = 0 } = options;
    const text = `${left}${right}`;
    const curRow = cursor.row + row;
    const curColumn = cursor.column + position;
    ace.editor.insert(text);
    ace.editor.moveCursorTo(curRow, curColumn + left.length);
  }
  ace.editor.focus();
}

export const insertHeadingTool = (ace: AceEditor, options: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}) => {
  if (!ace || !ace.editor) return;

  // 1. 获取当前行数，在下方创建一行
  const cursor = ace.editor.getCursorPosition();
  const currentRow = cursor.row;
  const isEditorEmpty = ace.editor.getValue().trim().length === 0;

  // 2. 在创建的行中插入标题
  const headingPrefix = '#'.repeat(options.level) + ' ';
  let text = `\n\n${headingPrefix}`;
  let targetRow = currentRow + 2;
  let targetColumn = headingPrefix.length;

  if (isEditorEmpty) {
    text = headingPrefix;
    targetRow = currentRow;
    targetColumn = headingPrefix.length;
  }

  ace.editor.insert(text);

  // 3. 将光标置于标题中
  ace.editor.moveCursorTo(targetRow, targetColumn);
  ace.editor.focus();
}