import { ChromeIcon } from "../../../../components/Icons"
import { Avatar, Box, Stack } from "@mui/material"
import React from "react"
import { getLinkFavicon, getResolvedLinkTitle, LinkAttributes } from "./shared"

interface LinkContentProps {
  attrs: LinkAttributes
  /** 是否为编辑模式 */
  editable?: boolean
}

/**
 * 链接内容组件
 * 用于渲染链接的实际内容，支持编辑和只读模式
 */
export const LinkContent: React.FC<LinkContentProps> = ({ attrs, editable = false }) => {
  const favicon = getLinkFavicon(attrs.href)

  // 编辑模式和只读模式的样式差异
  const blockStyles = editable ? {
    display: 'flex',
    border: '1px solid',
    borderColor: 'divider',
    cursor: 'pointer',
    textAlign: 'left',
    borderRadius: 'var(--mui-shape-borderRadius)',
    p: 2,
    textDecoration: 'none',
    color: 'inherit',
    ':hover': {
      borderColor: 'primary.main',
    },
  } : {
    display: 'block',
  }

  const blockInnerStyles = editable ? {
    width: '100%'
  } : {
    border: '1px solid',
    borderColor: 'divider',
    color: 'text.primary',
    cursor: 'pointer',
    textAlign: 'left',
    borderRadius: 'var(--mui-shape-borderRadius)',
    p: 2,
    ':hover': {
      borderColor: 'primary.main',
    },
  }

  const inlineStyles = editable ? {
    color: 'primary.main',
    cursor: 'pointer',
    borderRadius: 'var(--mui-shape-borderRadius)',
    transition: 'background-color 0.2s ease',
    display: 'inline',
    ':hover': {
      textDecoration: 'underline !important',
    },
  } : {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: '2px',
    color: 'primary.main',
    '&:hover': {
      textDecoration: 'underline !important',
    },
  }

  return (
    <>
      {attrs.type === 'block' ? (
        <Box
          component="a"
          href={attrs.href}
          target={attrs.target}
          rel={editable ? (attrs.target === '_blank' ? 'noopener noreferrer' : undefined) : attrs.rel}
          {...(!editable && { 'data-title': attrs.title, 'data-type': attrs.type })}
          sx={blockStyles}
        >
          <Stack
            direction={'row'}
            alignItems={'center'}
            gap={2}
            sx={blockInnerStyles}
          >
            <Avatar
              sx={{
                width: '2rem',
                height: '2rem',
                alignSelf: 'center',
                bgcolor: '#FFFFFF',
              }}
              src={favicon}
            >
              <ChromeIcon sx={{
                fontSize: '2rem',
                cursor: 'grab',
                color: 'primary.main',
                alignSelf: 'center',
                ':active': {
                  cursor: 'grabbing',
                }
              }} />
            </Avatar>
            <Stack sx={{ flex: 1 }} gap={0.5}>
              <Box sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{getResolvedLinkTitle(attrs)}</Box>
              <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{attrs.href}</Box>
            </Stack>
          </Stack>
        </Box>
      ) : (
        <Box
          component="a"
          href={attrs.href}
          target={attrs.target}
          rel={editable ? (attrs.target === '_blank' ? 'noopener noreferrer' : undefined) : attrs.rel}
          {...(!editable && { 'data-title': attrs.title, 'data-type': attrs.type })}
          sx={inlineStyles}
        >
          {editable ? (
            <Box component={'span'} sx={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: 0.5,
            }}>
              {attrs.type === 'icon' && <Avatar
                sx={{ width: '1rem', height: '1rem', alignSelf: 'center', bgcolor: '#FFFFFF' }}
                src={favicon}
              >
                <ChromeIcon sx={{
                  fontSize: '1rem',
                  cursor: 'grab',
                  color: 'primary.main',
                  alignSelf: 'center',
                  ':active': {
                    cursor: 'grabbing',
                  }
                }} />
              </Avatar>}
              {getResolvedLinkTitle(attrs)}
            </Box>
          ) : (
            <>
              {attrs.type === 'icon' && <Avatar
                sx={{ width: '1rem', height: '1rem', alignSelf: 'center', bgcolor: '#FFFFFF' }}
                src={favicon}
              >
                <ChromeIcon sx={{
                  fontSize: '1rem',
                  cursor: 'grab',
                  color: 'primary.main',
                  alignSelf: 'center',
                  ':active': {
                    cursor: 'grabbing',
                  }
                }} />
              </Avatar>}
              {getResolvedLinkTitle(attrs)}
            </>
          )}
        </Box>
      )}
    </>
  )
}

export default LinkContent
