import { Box } from '@mui/material';
import { Editor, EditorThemeProvider, EditorToolbar, TocList, useTiptap } from '@yu-cq/tiptap';
import React from 'react';

const Reader = () => {
  const handleTocUpdate = (toc: TocList) => {
    console.log(toc)
  }
  const { editor } = useTiptap({
    editable: true,
    limit: 100,
    exclude: ['invisibleCharacters'],
    onSave: (editor) => {
      console.log(editor.getHTML())
      editor.commands.setContent(editor.getHTML())
    },
    onTocUpdate: handleTocUpdate,
    onMentionFilter: async ({ query }) => {
      return new Promise((resolve) => {
        resolve([
          'Winona Ryder',
          'Molly Ringwald',
          'Ally Sheedy',
          'Debbie Harry',
          'Olivia Newton-John',
          'Elton John',
          'Michael J. Fox',
          'Axl Rose',
          'Emilio Estevez',
          'Ralph Macchio',
          'Rob Lowe',
          'Jennifer Grey',
        ].filter(item => item.toLowerCase().startsWith(query.toLowerCase()))
          .slice(0, 5))
      })
    },
    onUpload: async (file, onProgress) => {
      return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 100) {
            progress = 100;
            onProgress?.({ progress: progress / 100 });
            clearInterval(interval);
            setTimeout(() => {
              if (file.type.startsWith('image/')) {
                resolve('https://placehold.co/800x400')
              } else if (file.type.startsWith('video/')) {
                resolve('http://vjs.zencdn.net/v/oceans.mp4')
              } else {
                resolve('https://placehold.co/800x400')
              }
            }, 200);
          } else {
            onProgress?.({ progress: progress / 100 });
          }
        }, 100);
      })
    },
    content: ``
  });

  return <EditorThemeProvider>
    <div style={{
      border: '1px solid #eee',
      borderRadius: '10px',
      padding: '0 10px 10px',
    }}>
      <div style={{
        borderBottom: '1px solid #eee',
        marginBottom: '30px',
      }}>
        <EditorToolbar editor={editor} />
      </div>
      <Box sx={{
        backgroundColor: '#fff',
        '.tiptap': {
          minHeight: '500px',
        }
      }}>
        <Editor editor={editor} />
      </Box>
    </div>
  </EditorThemeProvider>
};

export default Reader; 