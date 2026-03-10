import { FileCopyLineIcon } from '@ctzhian/tiptap/component/Icons';
import { Box, Divider, Stack } from '@mui/material';
import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import React, { memo, useCallback, useState } from 'react';

interface CodeBlockAttributes {
  language?: string;
  title?: string;
}

const ReadonlyCodeBlock: React.FC<NodeViewProps> = memo(({
  node,
  selected,
  editor,
  getPos,
}) => {
  const [copyText, setCopyText] = useState('复制');
  const [isHovering, setIsHovering] = useState(false);

  const attrs = node.attrs as CodeBlockAttributes;

  const handleWrapperCopy = useCallback(
    (event: React.ClipboardEvent<HTMLElement>) => {
      const { state } = editor;
      const { selection } = state;
      const { $from, $to, empty } = selection;
      if (empty) return;
      const pos = typeof getPos === 'function' ? getPos() : undefined;
      if (pos === undefined) return;
      const nodeStart = pos + 1;
      const nodeEnd = pos + node.nodeSize - 1;
      if ($from.pos < nodeStart || $to.pos > nodeEnd) return;
      const selectedText = state.doc.textBetween($from.pos, $to.pos, '\n');
      event.clipboardData.clearData();
      event.clipboardData.setData('text/plain', selectedText);
      event.preventDefault();
      event.stopPropagation();
    },
    [editor, node, getPos],
  );

  const handleCopy = useCallback(
    async (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const codeText = node.textContent || '';
      try {
        await navigator.clipboard.writeText(codeText);
        setCopyText('复制成功');
        const timer = setTimeout(() => {
          setCopyText('复制');
        }, 2000);
        return () => clearTimeout(timer);
      } catch (err) {
        console.error('复制失败:', err);
      }
    },
    [node],
  );

  return (
    <NodeViewWrapper
      className={`codeblock-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
      data-drag-handle
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onCopy={handleWrapperCopy}
    >
      <Box sx={{
        position: 'relative',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 'var(--mui-shape-borderRadius)',
        overflow: 'hidden',
      }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          className="codeblock-toolbar"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1.25rem',
            lineHeight: '1.25rem',
            px: 2.5,
            py: 2,
            zIndex: 1,
            color: 'text.tertiary',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              flex: 1,
              fontSize: '0.875rem',
              letterSpacing: '0.01rem',
            }}
          >
            {attrs.title || '代码块'}
          </Box>
          {isHovering && <Stack direction="row" alignItems="center" gap={0.5} sx={{
            fontSize: '0.75rem',
          }}>
            <Box>{attrs.language || 'Auto'}</Box>
            <Divider orientation="vertical" flexItem sx={{ height: '0.75rem', ml: 1, alignSelf: 'center', borderColor: 'divider' }} />
            <Stack direction="row" alignItems="center" gap={0.5}
              onClick={handleCopy}
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 'var(--mui-shape-borderRadius)',
                cursor: 'pointer',
                userSelect: 'none',
                bgcolor: 'inherit',
                color: 'inherit',
              }}>
              <FileCopyLineIcon sx={{ fontSize: '0.75rem', color: 'inherit' }} />
              <Box sx={{ lineHeight: 1 }}>
                {copyText}
              </Box>
            </Stack>
          </Stack>}
        </Stack>
        <Box component={'pre'} sx={{
          m: 0,
        }}>
          <NodeViewContent<'code'>
            as="code"
            className='hljs'
            style={{
              backgroundColor: 'var(--mui-palette-background-paper3)',
              color: 'var(--mui-palette-text-primary)',
              padding: '3rem 1.25rem 0.75rem 1.25rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          />
        </Box>
      </Box>
    </NodeViewWrapper>
  );
});

ReadonlyCodeBlock.displayName = 'ReadonlyCodeBlock';

export default ReadonlyCodeBlock;