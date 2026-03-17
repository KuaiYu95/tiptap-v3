import {
  ArrowDownSLineIcon,
  CheckboxCircleLineIcon,
  FileCopyLineIcon
} from '../../../../components/Icons';
import { Box, Divider, ListSubheader, MenuItem, Select, Stack, TextField } from '@mui/material';
import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReadonlyCodeBlock from './Readonly';
import {
  CodeBlockAttributes,
  DEFAULT_CODE_BLOCK_TITLE,
  filterCodeLanguages,
  isCustomCodeLanguage,
  useCodeBlockCopy,
} from './shared';

const CodeBlockView: React.FC<NodeViewProps> = (props) => {
  const { node, updateAttributes, selected, editor } = props;
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [titleValue, setTitleValue] = useState(node.attrs.title || '');
  const [searchText, setSearchText] = useState('');
  const menuListRef = useRef<HTMLUListElement>(null);

  const attrs = node.attrs as CodeBlockAttributes;
  const { copyText, handleCopy } = useCodeBlockCopy(node.textContent || '');

  const filteredLanguages = useMemo(() => filterCodeLanguages(searchText), [searchText]);

  // 当搜索文本改变时，重置滚动位置
  useEffect(() => {
    if (menuListRef.current) {
      menuListRef.current.scrollTop = 0;
    }
  }, [searchText]);

  const handleLanguageChange = useCallback(
    (language: string) => {
      updateAttributes({ language });
    },
    [updateAttributes],
  );

  const handleTitleToggle = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setShowTitleInput(!showTitleInput);
    },
    [showTitleInput],
  );

  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitleValue(event.target.value);
    },
    [],
  );

  const handleTitleSubmit = useCallback(() => {
    updateAttributes({ title: titleValue });
    setShowTitleInput(false);
  }, [titleValue, updateAttributes]);

  const handleTitleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleTitleSubmit();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setTitleValue(attrs.title || '');
        setShowTitleInput(false);
      }
    },
    [handleTitleSubmit, attrs.title],
  );

  if (!editor.isEditable) {
    return <ReadonlyCodeBlock {...props} />;
  }

  return (
    <NodeViewWrapper
      className={`codeblock-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
      data-drag-handle
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
            pl: 2.5,
            pr: 1,
            py: 2,
            zIndex: 1,
            color: 'text.tertiary',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {showTitleInput ? (
            <Box
              sx={{
                flex: 1,
                height: '1.25rem',
                lineHeight: '1.25rem',
                borderRadius: '4px',
                bgcolor: 'background.paper3',
                boxSizing: 'border-box',
                letterSpacing: '0.01rem',
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="请输入代码块名称"
                value={titleValue}
                onChange={handleTitleChange}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleTitleSubmit}
                autoFocus
                sx={{
                  '& .MuiInputBase-input': {
                    p: 0,
                    height: '1.25rem',
                    lineHeight: '1.25rem',
                    fontSize: '0.875rem',
                    color: 'text.tertiary',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    fontSize: '0.875rem',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      border: 'none',
                      top: 0,
                      p: 0,
                    },
                  },
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                flex: 1,
                fontSize: '0.875rem',
                letterSpacing: '0.01rem',
              }}
              onClick={handleTitleToggle}
            >
              {attrs.title || DEFAULT_CODE_BLOCK_TITLE}
            </Box>
          )}
          <Stack direction="row" alignItems="center" sx={{ fontSize: '0.75rem', flexShrink: 0 }}>
            <Select
              value={attrs.language || 'auto'}
              onChange={(e) => handleLanguageChange(e.target.value)}
              onClose={() => setSearchText('')}
              size="small"
              variant="outlined"
              sx={{
                px: 0,
                height: '1.25rem',
                fontSize: '0.75rem',
                bgcolor: 'inherit',
                color: 'inherit',
                '&.MuiOutlinedInput-root .MuiSelect-select': {
                  p: 0,
                  pl: 1,
                  pr: 'calc(var(--mui-spacing-unit) * 3) !important',
                },
                '& .MuiSelect-icon': {
                  color: 'inherit',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              }}
              IconComponent={({ className, ...rest }) => {
                return (
                  <ArrowDownSLineIcon
                    className={className}
                    {...rest}
                    sx={{ fontSize: '1rem' }}
                  />
                );
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 400,
                    p: 0,
                  },
                },
                autoFocus: false,
                MenuListProps: {
                  ref: menuListRef,
                },
              }}
            >
              <ListSubheader
                sx={{
                  position: 'sticky',
                  top: 0,
                  bgcolor: 'background.default',
                  zIndex: 1,
                  p: 0.5,
                  lineHeight: 1,
                }}
              >
                <TextField
                  size="small"
                  autoFocus
                  placeholder="搜索语言..."
                  fullWidth
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: '0.75rem',
                    },
                  }}
                />
              </ListSubheader>
              {searchText && (
                <MenuItem
                  value={searchText}
                  sx={{
                    fontSize: '0.75rem',
                    height: '30px',
                    m: 0.5,
                    bgcolor: 'action.hover',
                    fontWeight: 500,
                  }}
                >
                  {searchText}
                  {filteredLanguages.length === 0 && ' (自定义)'}
                </MenuItem>
              )}
              {!searchText &&
                attrs.language &&
                isCustomCodeLanguage(attrs.language) && (
                  <MenuItem value={attrs.language} sx={{ fontSize: '0.75rem', height: '30px', m: 0.5 }}>
                    {attrs.language}
                  </MenuItem>
                )}
              {filteredLanguages.map((lang) => (
                <MenuItem
                  key={lang.value}
                  value={lang.value}
                  sx={{ fontSize: '0.75rem', height: '30px', m: 0.5 }}
                >
                  {lang.label}
                </MenuItem>
              ))}
            </Select>
            <Divider orientation="vertical" flexItem sx={{ height: '1rem', alignSelf: 'center', borderColor: 'divider' }} />
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
              {copyText === '复制成功' ? <CheckboxCircleLineIcon sx={{ fontSize: '0.75rem', color: 'success.main' }} /> :
                <FileCopyLineIcon sx={{ fontSize: '0.75rem', color: 'inherit' }} />}
              <Box sx={{ lineHeight: 1, ...(copyText === '复制成功' ? { color: 'success.main' } : {}) }}>
                {copyText}
              </Box>
            </Stack>
          </Stack>
        </Stack>
        <Box component={'pre'} sx={{ m: 0 }}>
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
};

export default CodeBlockView;
