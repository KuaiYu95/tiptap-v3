import { Box, Paper, Stack } from '@mui/material'
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

export interface MentionListProps {
  items: string[]
  command: (props: { id: string }) => void
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]

    if (item) {
      props.command({ id: item })
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <Paper sx={{
      position: 'relative',
      overflowY: 'auto',
      p: 0.5,
    }}>
      <Stack>
        {props.items.length ? (
          props.items.map((item, index) => (
            <Box
              key={index}
              onClick={() => selectItem(index)}
              sx={{
                px: 2,
                py: 1,
                fontSize: 14,
                cursor: 'pointer',
                borderRadius: 'var(--mui-shape-borderRadius)',
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
                ...(index === selectedIndex && {
                  backgroundColor: 'action.selected',
                }),
              }}
            >
              @{item}
            </Box>
          ))
        ) : (
          <Box sx={{ px: 2, py: 1, color: 'var(--mui-palette-text-tertiary)' }}>No result</Box>
        )}
      </Stack>
    </Paper>
  )
})