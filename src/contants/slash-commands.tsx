import { Editor } from '@tiptap/react';
import * as React from 'react';
import { AttachmentLineIcon, BilibiliLineIcon, CodeBoxLineIcon, CodeLineIcon, DoubleQuotesLIcon, EmotionLineIcon, FlipGridIcon, FlowChartIcon, FunctionsIcon, H1Icon, H2Icon, H3Icon, ImageLineIcon, Information2LineIcon, LinkIcon, ListCheck2Icon, ListOrdered2Icon, ListUnorderedIcon, MenuFold2FillIcon, MovieLineIcon, Music2LineIcon, SeparatorIcon, SketchingIcon, SquareRootIcon, Table2Icon, WindowFillIcon } from '../component/Icons';

export const slashCommands = [
  {
    title: '标题1',
    shortcutKey: ['ctrl', 'alt', '1'],
    icon: <H1Icon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
    }
  },
  {
    title: '标题2',
    shortcutKey: ['ctrl', 'alt', '2'],
    icon: <H2Icon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
    }
  },
  {
    title: '标题3',
    shortcutKey: ['ctrl', 'alt', '3'],
    icon: <H3Icon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
    }
  },
  {
    title: '有序列表',
    shortcutKey: ['ctrl', 'shift', '7'],
    icon: <ListOrdered2Icon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    }
  },
  {
    title: '无序列表',
    shortcutKey: ['ctrl', 'shift', '8'],
    icon: <ListUnorderedIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    }
  },
  {
    title: '任务列表',
    shortcutKey: ['ctrl', 'shift', '9'],
    icon: <ListCheck2Icon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    }
  },
  {
    title: '分割线',
    icon: <SeparatorIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    }
  },
  {
    title: '链接',
    shortcutKey: ['ctrl', '1'],
    icon: <LinkIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setInlineLink({ href: '' }).run()
    }
  },
  {
    title: '表情',
    icon: <EmotionLineIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().deleteRange(range).insertContentAt(range.from, ' : ').focus(range.from + 2).run()
    }
  },
  {
    title: '行内代码',
    shortcutKey: ['ctrl', 'E'],
    icon: <CodeLineIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setMark('code').run()
    }
  },
  {
    title: '代码块',
    shortcutKey: ['ctrl', 'alt', 'C'],
    icon: <CodeBoxLineIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    }
  },
  {
    title: '引用',
    shortcutKey: ['ctrl', 'shift', 'B'],
    icon: <DoubleQuotesLIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    }
  },
  {
    title: '分栏',
    icon: <FlipGridIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setFlipGrid().run()
    }
  },
  {
    title: '折叠面板',
    shortcutKey: ['ctrl', '8'],
    icon: <MenuFold2FillIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setDetails().run()
    }
  },
  {
    title: 'Mermaid 流程图',
    icon: <FlowChartIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setFlow({ code: '', width: '100%' }).run()
    }
  },
  {
    title: 'Excalidraw 绘图',
    icon: <SketchingIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setExcalidraw().run()
    }
  },
  {
    title: 'Bilibili 视频',
    icon: <BilibiliLineIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setIframe({ src: '', width: '100%', height: 400, type: 'bilibili' }).run()
    }
  },
  {
    title: 'Iframe',
    icon: <WindowFillIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setIframe({ src: '', width: '100%', height: 400, type: 'iframe' }).run()
    }
  },
  {
    title: '表格',
    shortcutKey: ['ctrl', '9'],
    icon: <Table2Icon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range, attrs }: { editor: Editor; range: { from: number; to: number }; attrs: any }) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: attrs.rows || 3, cols: attrs.cols || 4, withHeaderRow: false }).run()
    },
  },
  {
    title: '警告块',
    icon: <Information2LineIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range, attrs }: { editor: Editor; range: { from: number; to: number }; attrs: any }) => {
      editor.chain().focus().deleteRange(range).toggleAlert({ type: attrs?.type || 'icon', variant: attrs?.variant || 'info' }).run()
    }
  },
  {
    title: '折叠面板',
    icon: <MenuFold2FillIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setDetails().run()
    }
  },
  {
    title: '代码块',
    icon: <CodeBoxLineIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    }
  },
  {
    title: '行内数学公式',
    icon: <SquareRootIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setInlineMath({ latex: '' }).run()
    }
  },
  {
    title: '块级数学公式',
    icon: <FunctionsIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setBlockMath({ latex: '' }).run()
    }
  },
  {
    title: '图片',
    icon: <ImageLineIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setImage({ src: '', width: 760 }).run()
    }
  },
  {
    title: '视频',
    icon: <MovieLineIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setVideo({ src: '', width: 760 }).run()
    }
  },
  {
    title: '音频',
    icon: <Music2LineIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setAudio({ src: '' }).run()
    }
  },
  {
    title: '附件',
    icon: <AttachmentLineIcon sx={{ fontSize: '1rem' }} />,
    command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } }) => {
      editor.chain().focus().deleteRange(range).setInlineAttachment({ url: '', title: '', size: '0' }).run()
    }
  },
]