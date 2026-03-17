import { Divider, Stack } from "@mui/material";
import React from "react";
import AceEditor from "react-ace";
import {
  buildHeadingOptions,
  buildInsertMenuList,
  buildTableMenuList,
  buildToolList,
} from "./toolbar-actions";
import MarkdownToolbarMenu from "./toolbar-menu";
import MarkdownToolbarToolList from "./toolbar-tool-list";
import { useMarkdownFileInputs } from "./use-markdown-file-inputs";
import { MarkdownUploadType } from "./use-markdown-upload";
import { insertBlockTool, insertHeadingTool, insertInlineTool } from "./util";

interface EditorMarkdownToolbarProps {
  aceEditorRef: React.RefObject<AceEditor>
  isExpend?: boolean
  onFileUpload: (file: File, expectedType?: MarkdownUploadType) => void;
}

const EditorMarkdownToolbar = ({ aceEditorRef, isExpend, onFileUpload }: EditorMarkdownToolbarProps) => {
  const handleInsertHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    if (!aceEditorRef.current) return;
    insertHeadingTool(aceEditorRef.current, { level })
  }

  const handleInsertInline = (options: {
    single?: string;
    left?: string;
    right?: string;
    position?: number;
    row?: number;
  }) => {
    if (!aceEditorRef.current) return;
    insertInlineTool(aceEditorRef.current, options)
  }

  const handleInsertBlock = (options: {
    text: string;
    position?: number;
    row?: number;
    wrap?: boolean;
  }) => {
    if (!aceEditorRef.current) return;
    insertBlockTool(aceEditorRef.current, options)
  }

  const headingOptions = buildHeadingOptions({ onInsertHeading: handleInsertHeading });
  const toolList = buildToolList({
    isExpend,
    onInsertInline: handleInsertInline,
    onInsertBlock: handleInsertBlock,
  });
  const fileInputs = useMarkdownFileInputs({ onFileUpload });
  const insertMenuList = buildInsertMenuList({
    isExpend,
    onInsertInline: handleInsertInline,
    onInsertBlock: handleInsertBlock,
    onUploadClick: fileInputs.openPicker,
  });
  const tableMenuList = buildTableMenuList({
    onInsertBlock: handleInsertBlock,
  });
  const headingMenuList = headingOptions.map((item) => ({
    label: item.label,
    key: item.id,
    icon: item.icon,
    onClick: item.onClick,
  }));

  return <Stack direction={'row'} alignItems={'center'}>
    <MarkdownToolbarMenu type="insert" list={insertMenuList} isExpend={isExpend} />
    <Divider
      sx={{ mx: 0.5, height: 20, alignSelf: 'center' }}
      orientation="vertical"
      flexItem
    />
    <MarkdownToolbarMenu type="heading" list={headingMenuList} isExpend={isExpend} />
    <MarkdownToolbarToolList items={toolList} />
    {isExpend && <MarkdownToolbarMenu type="table" list={tableMenuList} isExpend={isExpend} />}
    {fileInputs.inputs}
  </Stack>
}

export default EditorMarkdownToolbar;
