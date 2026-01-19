import { Download2LineIcon, FileIcon } from "@ctzhian/tiptap/component/Icons"
import { EyeLineIcon } from "@ctzhian/tiptap/component/Icons/eye-line-icon"
import { Box, IconButton, Stack } from "@mui/material"
import React, { useState } from "react"
import { AttachmentAttributes } from "."

interface AttachmentContentProps {
  attrs: AttachmentAttributes
  type: 'icon' | 'block'
  isPdf: boolean
  editable?: boolean
}

/**
 * 附件内容组件
 * 用于渲染附件的实际内容，支持编辑和只读模式
 */
export const AttachmentContent: React.FC<AttachmentContentProps> = ({ attrs, type, isPdf, editable = false }) => {
  const [isHovered, setIsHovered] = useState(false)
  const blockStyles = editable ? {
    display: 'flex',
    border: '1px solid',
    borderColor: attrs.url === 'error' ? 'error.main' : 'divider',
    cursor: 'pointer',
    borderRadius: 'var(--mui-shape-borderRadius)',
    bgcolor: 'background.paper',
    p: 2,
    color: 'inherit',
    ':hover': {
      borderColor: attrs.url === 'error' ? 'error.main' : 'primary.main',
    },
  } : attrs.view === '1' ? {
    display: 'flex',
    border: '1px solid',
    borderColor: attrs.url === 'error' ? 'error.main' : 'divider',
    cursor: 'pointer',
    borderRadius: 'var(--mui-shape-borderRadius)',
    bgcolor: 'background.paper',
    p: 2,
    color: 'inherit',
    ':hover': {
      borderColor: attrs.url === 'error' ? 'error.main' : 'primary.main',
    },
  } : {
    display: 'block',
  }

  const blockInnerStyles = editable ? {
    width: '100%'
  } : {
    border: '1px solid',
    borderColor: attrs.url === 'error' ? 'error.main' : 'divider',
    color: 'text.primary',
    cursor: 'pointer',
    borderRadius: 'var(--mui-shape-borderRadius)',
    bgcolor: 'background.paper',
    p: 2,
    ':hover': {
      borderColor: attrs.url === 'error' ? 'error.main' : 'primary.main',
    },
  }

  const inlineStyles = editable ? {
    color: 'primary.main',
    cursor: 'pointer',
    borderRadius: 'var(--mui-shape-borderRadius)',
    transition: 'background-color 0.2s ease',
    display: 'inline',
    ':hover': {
      bgcolor: 'background.paper',
    },
  } : {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    color: 'primary.main',
    cursor: 'pointer',
  }

  return (
    <>
      {type === 'block' ? (
        attrs.view === '1' && isPdf && attrs.url && attrs.url !== 'error' ? (
          <Box
            sx={{
              ...blockStyles,
              p: 0,
              overflow: 'hidden',
            }}
            {...(!editable && { 'data-title': attrs.title, 'data-type': type })}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <iframe
              src={attrs.url + '#navpanes=0&toolbar=1'}
              width="100%"
              height="300px"
              allowFullScreen
              style={{
                border: 'none',
                display: 'block',
              }}
              title={attrs.title}
            />
          </Box>
        ) : (
          <Box
            {...(!editable && { 'data-title': attrs.title, 'data-type': attrs.type })}
            sx={blockStyles}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Stack
              direction={'row'}
              alignItems={'center'}
              gap={2}
              sx={blockInnerStyles}
              {...(!editable && { 'data-title': attrs.title, 'data-type': type })}
            >
              <FileIcon sx={{
                fontSize: '1.625rem',
                color: attrs.url === 'error' ? 'error.main' : 'primary.main',
                alignSelf: 'center',
              }} />
              <Stack sx={{ flex: 1 }} gap={0.5}>
                <Box sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                  {attrs.title}
                </Box>
                {Number(attrs.size) > 0 && <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{attrs.size}</Box>}
              </Stack>
              {isHovered && <Stack direction={'row'} gap={0.5}>
                {isPdf && <Box
                  component="a"
                  href={attrs.url}
                  target='_blank'
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconButton size="small"
                    sx={{
                      color: attrs.url === 'error' ? 'error.main' : 'text.disabled',
                      alignSelf: 'center',
                    }}
                  >
                    <EyeLineIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Box>}
                <Box
                  component="a"
                  href={attrs.url}
                  target='_blank'
                  download={attrs.title}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconButton size="small"
                    sx={{
                      color: attrs.url === 'error' ? 'error.main' : 'text.disabled',
                      alignSelf: 'center',
                    }}
                  >
                    <Download2LineIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Box>
              </Stack>}
            </Stack>
          </Box>
        )
      ) : (
        <Box
          component="a"
          href={attrs.url}
          target='_blank'
          download={attrs.title}
          {...(!editable && { 'data-title': attrs.title, 'data-type': attrs.type })}
          sx={inlineStyles}
          onClick={(e) => e.stopPropagation()}
        >
          {editable ? (
            <Box component={'span'} sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
            }}>
              <Download2LineIcon sx={{
                fontSize: '0.875rem',
                cursor: 'grab',
                color: 'primary.main',
                alignSelf: 'center',
                ':active': {
                  cursor: 'grabbing',
                }
              }} />
              {attrs.title}
            </Box>
          ) : (
            <>
              <Download2LineIcon sx={{
                fontSize: '0.875rem',
                cursor: 'grab',
                color: 'primary.main',
                alignSelf: 'center',
                ':active': {
                  cursor: 'grabbing',
                }
              }} />
              {attrs.title}
            </>
          )}
        </Box>
      )}
    </>
  )
}

export default AttachmentContent

