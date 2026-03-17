// import { Divider, Paper, Stack } from "@mui/material";
// import { Editor } from "@tiptap/react";
// import React from "react";
// // @ts-ignore
// import { CodeBoxLineIcon, H1Icon, H2Icon, H3Icon, ListCheck3Icon, ListOrdered2Icon, ListUnorderedIcon, QuoteTextIcon, Table2Icon } from "@ctzhian/tiptap/component/Icons";
// import { FloatingMenu } from "@tiptap/react/menus";
// import ToolItem from "../ToolItem";

// const CustomFloatingMenu = (props: { editor: Editor }) => {
//   const { editor } = props

//   return <FloatingMenu
//     editor={editor}
//     pluginKey={'floating-menu'}
//     options={{
//       placement: 'right',
//       offset: 8,
//     }}
//   >
//     <Paper sx={{
//       p: 0.5,
//     }}>
//       <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//         <ToolItem
//           icon={<H1Icon />}
//           size='small'
//           onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
//           isActive={editor.isActive('heading', { level: 1 })}
//         />
//         <ToolItem
//           icon={<H2Icon />}
//           size='small'
//           onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
//           isActive={editor.isActive('heading', { level: 2 })}
//         />
//         <ToolItem
//           icon={<H3Icon />}
//           size='small'
//           onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
//           isActive={editor.isActive('heading', { level: 3 })}
//         />
//         <Divider orientation='vertical' flexItem sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }} />
//         <ToolItem
//           icon={<ListCheck3Icon />}
//           size='small'
//           onClick={() => editor.chain().focus().toggleTaskList().run()}
//           isActive={editor.isActive('taskList')}
//         />
//         <ToolItem
//           icon={<ListUnorderedIcon />}
//           size='small'
//           onClick={() => editor.chain().focus().toggleBulletList().run()}
//           isActive={editor.isActive('bulletList')}
//         />
//         <ToolItem
//           icon={<ListOrdered2Icon />}
//           size='small'
//           onClick={() => editor.chain().focus().toggleOrderedList().run()}
//           isActive={editor.isActive('orderedList')}
//         />
//         <Divider orientation='vertical' flexItem sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }} />
//         <ToolItem
//           icon={<QuoteTextIcon />}
//           size='small'
//           onClick={() => editor.chain().focus().toggleBlockquote().run()}
//           isActive={editor.isActive('blockquote')}
//         />
//         <ToolItem
//           icon={<Table2Icon />}
//           size='small'
//           onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 4, withHeaderRow: false }).run()}
//           isActive={editor.isActive('table')}
//         />
//         <ToolItem
//           icon={<CodeBoxLineIcon />}
//           size='small'
//           onClick={() => editor.chain().focus().toggleCodeBlock().run()}
//           isActive={editor.isActive('codeBlock')}
//         />
//       </Stack>
//     </Paper>
//   </FloatingMenu>
// }

// export default CustomFloatingMenu
