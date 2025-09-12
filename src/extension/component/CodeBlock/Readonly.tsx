import { CopyIcon } from '@ctzhian/tiptap/component/Icons';
import { Box, Stack } from '@mui/material';
import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import React, { useCallback, useState } from 'react';

interface CodeBlockAttributes {
  language?: string;
  title?: string;
}

const ReadonlyCodeBlock: React.FC<NodeViewProps> = ({
  node,
  selected
}) => {
  const [copyText, setCopyText] = useState('复制');
  const [isHovering, setIsHovering] = useState(false);

  const attrs = node.attrs as CodeBlockAttributes;

  const handleCopy = useCallback(async (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const codeText = node.textContent || '';
    try {
      await navigator.clipboard.writeText(codeText);
      setCopyText('复制成功');
      setTimeout(() => {
        setCopyText('复制');
      }, 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, [node]);

  return (
    <NodeViewWrapper
      className={`codeblock-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
      data-drag-handle
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Box
        component="pre"
        sx={{
          p: '0.75rem 1rem',
          m: 0,
          borderRadius: 1,
          bgcolor: 'background.paper',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {isHovering && <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            px: 0.5,
            pt: 0.5,
            zIndex: 1,
          }}
        >
          <Stack direction="row" alignItems="center" gap={0.5}
            onClick={handleCopy}
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 'var(--mui-shape-borderRadius)',
              cursor: 'pointer',
              userSelect: 'none',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}>
            <CopyIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
            <Box sx={{ fontSize: '0.75rem', lineHeight: 1 }}>
              {copyText}
            </Box>
          </Stack>
        </Stack>}
        <NodeViewContent
          style={{
            margin: 0,
            fontSize: '0.875rem',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        />
      </Box>
      {attrs.title && (
        <Box
          sx={{
            pl: 1,
            pt: 0.5,
            height: '1rem',
            lineHeight: 1,
            fontSize: '0.875rem',
            color: 'text.secondary',
            letterSpacing: '0.01rem',
          }}
        >
          {attrs.title}
        </Box>
      )}
    </NodeViewWrapper>
  );
};

export default ReadonlyCodeBlock;