import { BoldIcon, CodeLineIcon, EraserLineIcon, ItalicIcon, MarkPenLineIcon, StrikethroughIcon, TooltipLineIcon, UnderlineIcon } from '@ctzhian/tiptap/component/Icons'
import { MenuItem } from '@ctzhian/tiptap/type'
import { hasMarksInSelection } from '@ctzhian/tiptap/util'
import { Divider, Paper, Stack } from '@mui/material'
import { Editor, useEditorState } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import React from 'react'
import { ToolbarItem } from '../Toolbar'

export interface CustomBubbleMenuProps {
  editor: Editor
  more?: MenuItem[]
}

const CustomBubbleMenu = ({ editor, more }: CustomBubbleMenuProps) => {
  const {
    isBold,
    isItalic,
    isStrike,
    isUnderline,
    isCode,
    isHighlight,
    isTooltip,
    hasAnyMarks,
  } = useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold'),
      isItalic: ctx.editor.isActive('italic'),
      isStrike: ctx.editor.isActive('strike'),
      isUnderline: ctx.editor.isActive('underline'),
      isCode: ctx.editor.isActive('code'),
      isHighlight: ctx.editor.isActive('highlight'),
      isTooltip: ctx.editor.isActive('tooltip'),
      hasAnyMarks: hasMarksInSelection(ctx.editor.state),
    })
  })

  if (editor && !editor.isEditable) {
    return null
  }

  return <BubbleMenu
    editor={editor}
    pluginKey={'bubble-menu'}
    updateDelay={750}
    options={{
      placement: 'bottom',
      offset: 8,
      flip: true,
    }}
    shouldShow={({ editor }) => {
      // 在某些特定节点类型时不显示
      if (
        editor.state.selection.empty ||
        editor.isEmpty ||
        editor.isActive('image') ||
        editor.isActive('video') ||
        editor.isActive('audio') ||
        editor.isActive('emoji') ||
        editor.isActive('codeBlock') ||
        editor.isActive('blockMath') ||
        editor.isActive('inlineMath') ||
        editor.isActive('blockLink') ||
        editor.isActive('inlineLink') ||
        editor.isActive('blockAttachment') ||
        editor.isActive('inlineAttachment') ||
        editor.isActive('horizontalRule') ||
        editor.isActive('iframe') ||
        editor.isActive('yamlFormat') ||
        editor.isActive('flow') ||
        editor.isActive('table') ||
        editor.isActive('flipGrid') ||
        editor.isActive('flipGridColumn') ||
        editor.isActive('excalidraw')
      ) {
        return false
      }

      return true
    }}
  >
    <Paper sx={{
      p: 0.5,
      borderRadius: 'var(--mui-shape-borderRadius)',
    }}>
      <Stack direction={'row'} alignItems={'center'}>
        <ToolbarItem
          icon={<BoldIcon sx={{ fontSize: '1rem' }} />}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={isBold ? "tool-active" : ""}
        />
        <ToolbarItem
          icon={<ItalicIcon sx={{ fontSize: '1rem' }} />}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={isItalic ? "tool-active" : ""}
        />
        <ToolbarItem
          icon={<StrikethroughIcon sx={{ fontSize: '1rem' }} />}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={isStrike ? "tool-active" : ""}
        />
        <ToolbarItem
          icon={<UnderlineIcon sx={{ fontSize: '1rem' }} />}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={isUnderline ? "tool-active" : ""}
        />
        <ToolbarItem
          icon={<MarkPenLineIcon sx={{ fontSize: '1rem' }} />}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={isHighlight ? "tool-active" : ""}
        />
        <ToolbarItem
          icon={<CodeLineIcon sx={{ fontSize: '1rem' }} />}
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={isCode ? "tool-active" : ""}
        />
        <ToolbarItem
          icon={<TooltipLineIcon sx={{ fontSize: '1rem' }} />}
          onClick={() => {
            if (isTooltip) {
              editor.chain().focus().unsetTooltip().run()
            } else {
              editor.chain().focus().toggleTooltip().run()
            }
          }}
          className={isTooltip ? "tool-active" : ""}
        />
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, alignSelf: 'center' }} />
        <ToolbarItem
          icon={<EraserLineIcon sx={{ fontSize: '1rem' }} />}
          text='清除格式'
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          disabled={!hasAnyMarks}
        />
        {more?.map((item) => (
          <ToolbarItem
            key={item.key}
            tip={item.label as string}
            icon={item.icon || <></>}
            onClick={item.onClick}
          />
        ))}
      </Stack>
    </Paper>
  </BubbleMenu>
}

export default CustomBubbleMenu
