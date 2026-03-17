import { ActionDropdown, HoverPopover } from '../../../../components'
import { CheckboxCircleFillIcon, CloseCircleFillIcon, ErrorWarningFillIcon, Information2FillIcon, ScrollToBottomLineIcon, TextIcon, UserSmileFillIcon } from '../../../../components/Icons'
import { ToolbarItem } from '../../../../components/Toolbar'
import { Box, Divider, Stack } from '@mui/material'
import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import React, { useMemo, useRef } from 'react'

export interface AlertAttributes {
  id?: string
  variant?: 'info' | 'warning' | 'error' | 'success' | 'default'
  type?: 'text' | 'icon'
}

const VARIANT_DATA: Record<string, { icon: React.ReactNode, color: string }> = {
  info: {
    icon: <Information2FillIcon sx={{ fontSize: '1.25rem' }} />,
    color: 'var(--mui-palette-primary-main)',
  },
  warning: {
    icon: <ErrorWarningFillIcon sx={{ fontSize: '1.25rem' }} />,
    color: 'var(--mui-palette-warning-main)',
  },
  error: {
    icon: <CloseCircleFillIcon sx={{ fontSize: '1.25rem' }} />,
    color: 'var(--mui-palette-error-main)',
  },
  success: {
    icon: <CheckboxCircleFillIcon sx={{ fontSize: '1.25rem' }} />,
    color: 'var(--mui-palette-success-main)',
  },
  default: {
    icon: <UserSmileFillIcon sx={{ fontSize: '1.25rem' }} />,
    color: 'var(--mui-palette-divider)',
  },
}

const AlertView: React.FC<NodeViewProps> = ({ editor, node, updateAttributes, selected }) => {
  const attrs = node.attrs as AlertAttributes
  const containerRef = useRef<HTMLDivElement | null>(null)

  const showIcon = attrs.type !== 'text'

  const variantData = useMemo(() => {
    if (attrs.variant && VARIANT_DATA[attrs.variant as keyof typeof VARIANT_DATA]) {
      return VARIANT_DATA[attrs.variant as keyof typeof VARIANT_DATA]
    }
    return VARIANT_DATA['default']
  }, [attrs.variant])

  const variantOptions = [
    { key: 'info' as const, label: '信息', icon: Information2FillIcon, color: 'primary.main' },
    { key: 'warning' as const, label: '警告', icon: ErrorWarningFillIcon, color: 'warning.main' },
    { key: 'error' as const, label: '错误', icon: CloseCircleFillIcon, color: 'error.main' },
    { key: 'success' as const, label: '成功', icon: CheckboxCircleFillIcon, color: 'success.main' },
    { key: 'default' as const, label: '默认', icon: UserSmileFillIcon, color: 'text.disabled' },
  ]

  const typeOptions = [
    {
      key: 'text' as const,
      label: '纯文字',
      icon: TextIcon,
      onClick: () => updateAttributes({ type: 'text' }),
    },
    {
      key: 'icon' as const,
      label: '图标文字',
      icon: ScrollToBottomLineIcon,
      iconTransform: 'rotate(90deg)',
      onClick: () => updateAttributes({ type: 'icon' }),
    },
  ]

  const renderOperationActions = () => (
    <Stack direction={'row'} alignItems={'center'} sx={{ p: 0.5 }}>
      {variantOptions.map((option) => {
        const IconComponent = option.icon
        return (
          <ToolbarItem
            key={option.key}
            icon={<IconComponent sx={{ fontSize: '1rem', color: option.color }} />}
            tip={option.label}
            onClick={() => updateAttributes({ variant: option.key })}
            className={attrs.variant === option.key ? 'tool-active' : ''}
          />
        )
      })}

      <Divider orientation='vertical' flexItem sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }} />

      <ActionDropdown
        id='alert-type-dropdown'
        selected={attrs.type || 'icon'}
        list={typeOptions.map((option) => {
          const IconComponent = option.icon
          return {
            key: option.key,
            label: option.label,
            icon: <IconComponent sx={{ fontSize: '1rem', ...(option.iconTransform ? { transform: option.iconTransform } : {}) }} />,
            onClick: option.onClick,
          }
        })}
      />
    </Stack>
  )

  return (
    <NodeViewWrapper
      ref={containerRef}
      className={`alert-wrapper ${selected ? 'ProseMirror-selectednode' : ''}`}
      data-drag-handle
      as={'div'}
    >
      {editor.isEditable ? (
        <HoverPopover
          actions={renderOperationActions()}
          placement="top"
          offset={4}
        >
          <Box sx={{
            marginLeft: (node.attrs as any)?.indent ? (node.attrs as any).indent * 32 : undefined,
            border: '1px solid',
            borderColor: variantData.color,
            borderRadius: 'var(--mui-shape-borderRadius)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            background: attrs.variant === 'default' ? 'var(--mui-palette-background-paper3)' : `color-mix(in srgb, ${variantData.color} 10%, transparent)`,
          }}>
            {showIcon && (
              <Box sx={{
                pt: '2px',
                lineHeight: 1,
                color: attrs.variant === 'default' ? 'text.disabled' : variantData.color,
              }}>{variantData.icon}</Box>
            )}
            <Box sx={{
              flex: 1,
              width: 0,
              'code': {
                borderColor: attrs.variant === 'default' ? '' : `color-mix(in srgb, ${variantData.color} 30%, transparent) !important`,
                bgcolor: attrs.variant === 'default' ? '' : `color-mix(in srgb, ${variantData.color} 10%, transparent) !important`,
              }
            }}>
              <NodeViewContent as={'div'} />
            </Box>
          </Box>
        </HoverPopover>
      ) : (
        <Box sx={{
          marginLeft: (node.attrs as any)?.indent ? (node.attrs as any).indent * 32 : undefined,
          border: '1px solid',
          borderColor: variantData.color,
          borderRadius: 'var(--mui-shape-borderRadius)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          background: attrs.variant === 'default' ? 'var(--mui-palette-background-paper3)' : `color-mix(in srgb, ${variantData.color} 10%, transparent)`,
        }}>
          {showIcon && (
            <Box sx={{
              pt: '2px',
              lineHeight: 1,
              color: attrs.variant === 'default' ? 'text.disabled' : variantData.color,
            }}>{variantData.icon}</Box>
          )}
          <Box sx={{
            flex: 1,
            width: 0,
            'code': {
              borderColor: attrs.variant === 'default' ? '' : `color-mix(in srgb, ${variantData.color} 30%, transparent) !important`,
              bgcolor: attrs.variant === 'default' ? '' : `color-mix(in srgb, ${variantData.color} 10%, transparent) !important`,
            }
          }}>
            <NodeViewContent as={'div'} />
          </Box>
        </Box>
      )}
    </NodeViewWrapper>
  )
}

export default AlertView
