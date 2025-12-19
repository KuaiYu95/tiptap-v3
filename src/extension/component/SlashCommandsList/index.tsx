import { NestedList } from '@ctzhian/tiptap/component'
import { ArrowDownSLineIcon, AttachmentLineIcon, CheckboxCircleFillIcon, CloseCircleFillIcon, ErrorWarningFillIcon, FormulaIcon, FunctionsIcon, ImageLineIcon, Information2FillIcon, Information2LineIcon, MovieLineIcon, Music2LineIcon, SquareRootIcon, Table2Icon, UploadIcon, UserSmileFillIcon } from '@ctzhian/tiptap/component/Icons'
import { ToolbarItem } from '@ctzhian/tiptap/component/Toolbar'
import TableSizePicker from '@ctzhian/tiptap/component/Toolbar/TableSizePicker'
import { SlashCommandsListProps, SlashCommandsListRef } from '@ctzhian/tiptap/type'
import { getShortcutKeyText } from '@ctzhian/tiptap/util'
import { Box, Divider, Stack, Typography } from '@mui/material'
import React, { forwardRef } from 'react'

const SlashCommandsList = forwardRef<SlashCommandsListRef, SlashCommandsListProps>(
  ({ items, command }, ref) => {

    if (items.length === 0) {
      return null
    }

    return (
      <Box
        sx={{
          width: '224px',
          p: 0.5
        }}
      >
        <Stack direction={'row'} flexWrap={'wrap'}>
          {items.slice(0, 18).map((item, index) => (
            <ToolbarItem
              key={index}
              shortcutKey={item?.shortcutKey || []}
              onClick={() => command(item)}
              icon={item.icon}
              tip={item.title}
            />
          ))}
        </Stack>
        <Divider sx={{ my: 0.5 }} />
        <NestedList
          list={[
            {
              label: '表格',
              key: 'table',
              icon: <Table2Icon sx={{ fontSize: '1rem' }} />,
              extra: <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>{getShortcutKeyText(['ctrl', '9'], '+')}</Typography>,
              children: [
                {
                  key: 'table-size-picker',
                  customLabel: <TableSizePicker
                    onConfirm={(cols, rows) => {
                      const node = items.find(it => it.title === '表格')
                      if (node) command({ ...node, attrs: { cols, rows } })
                    }}
                  />
                },
              ],
            },
            {
              label: '警告块',
              key: 'highlight',
              icon: <Information2LineIcon sx={{ fontSize: '1rem' }} />,
              children: [
                {
                  label: '信息 Info',
                  key: 'info',
                  icon: <Information2FillIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />,
                  onClick: () => {
                    const node = items.find(it => it.title === '警告块')
                    if (node) command({ ...node, attrs: { type: 'icon', variant: 'info' } })
                  },
                },
                {
                  label: '警告 Warning',
                  key: 'warning',
                  icon: <ErrorWarningFillIcon sx={{ fontSize: '1rem', color: 'warning.main' }} />,
                  onClick: () => {
                    const node = items.find(it => it.title === '警告块')
                    if (node) command({ ...node, attrs: { type: 'icon', variant: 'warning' } })
                  },
                },
                {
                  label: '错误 Error',
                  key: 'error',
                  icon: <CloseCircleFillIcon sx={{ fontSize: '1rem', color: 'error.main' }} />,
                  onClick: () => {
                    const node = items.find(it => it.title === '警告块')
                    if (node) command({ ...node, attrs: { type: 'icon', variant: 'error' } })
                  },
                },
                {
                  label: '成功 Success',
                  key: 'success',
                  icon: <CheckboxCircleFillIcon sx={{ fontSize: '1rem', color: 'success.main' }} />,
                  onClick: () => {
                    const node = items.find(it => it.title === '警告块')
                    if (node) command({ ...node, attrs: { type: 'icon', variant: 'success' } })
                  },
                },
                {
                  label: '默认 Default',
                  key: 'default',
                  icon: <UserSmileFillIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />,
                  onClick: () => {
                    const node = items.find(it => it.title === '警告块')
                    if (node) command({ ...node, attrs: { type: 'icon', variant: 'default' } })
                  },
                }
              ]
            },
            {
              label: '数学公式',
              key: 'math',
              icon: <FormulaIcon sx={{ fontSize: '1rem' }} />,
              children: [
                {
                  label: '行内数学公式',
                  key: 'inline-math',
                  extra: <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>{getShortcutKeyText(['ctrl', '6'], '+')}</Typography>,
                  icon: <SquareRootIcon sx={{ fontSize: '1rem' }} />,
                  onClick: () => {
                    const node = items.find(it => it.title === '行内数学公式')
                    if (node) command(node)
                  }
                },
                {
                  label: '块级数学公式',
                  key: 'block-math',
                  extra: <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>{getShortcutKeyText(['ctrl', '7'], '+')}</Typography>,
                  icon: <FunctionsIcon sx={{ fontSize: '1rem' }} />,
                  onClick: () => {
                    const node = items.find(it => it.title === '块级数学公式')
                    if (node) command(node)
                  }
                }
              ]
            },
            {
              label: '上传文件',
              key: 'download',
              icon: <UploadIcon sx={{ fontSize: '1rem' }} />,
              children: [
                {
                  label: '上传图片',
                  key: 'image',
                  extra: <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>{getShortcutKeyText(['ctrl', '2'], '+')}</Typography>,
                  icon: <ImageLineIcon sx={{ fontSize: '1rem' }} />,
                  onClick: () => {
                    const node = items.find(it => it.title === '图片')
                    if (node) command(node)
                  }
                },
                {
                  label: '上传视频',
                  key: 'video',
                  extra: <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>{getShortcutKeyText(['ctrl', '3'], '+')}</Typography>,
                  icon: <MovieLineIcon sx={{ fontSize: '1rem' }} />,
                  onClick: () => {
                    const node = items.find(it => it.title === '视频')
                    if (node) command(node)
                  }
                },
                {
                  label: '上传音频',
                  key: 'audio',
                  extra: <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>{getShortcutKeyText(['ctrl', '4'], '+')}</Typography>,
                  icon: <Music2LineIcon sx={{ fontSize: '1rem' }} />,
                  onClick: () => {
                    const node = items.find(it => it.title === '音频')
                    if (node) command(node)
                  }
                },
                {
                  label: '上传附件',
                  key: 'attachment',
                  extra: <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>{getShortcutKeyText(['ctrl', '5'], '+')}</Typography>,
                  icon: <AttachmentLineIcon sx={{ fontSize: '1rem' }} />,
                  onClick: () => {
                    const node = items.find(it => it.title === '附件')
                    if (node) command(node)
                  }
                }
              ]
            }
          ]}
          arrowIcon={<ArrowDownSLineIcon sx={{ fontSize: '1rem', transform: 'rotate(-90deg)' }} />}
        />
      </Box>
    )
  }
)

SlashCommandsList.displayName = 'SlashCommandsList'

export default SlashCommandsList
