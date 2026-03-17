import { FloatingPopover } from '../../../../components'
import { SlashCommandsListRef } from '../../../../types'
import { VirtualElement } from '@floating-ui/dom'
import { SuggestionProps } from '@tiptap/suggestion'
import React, { forwardRef, useMemo } from 'react'
import SlashCommandsList from './index'

export type SlashCommandsOverlayProps = SuggestionProps<any> & {
  open: boolean
}

const SlashCommandsOverlay = forwardRef<SlashCommandsListRef, SlashCommandsOverlayProps>((props, ref) => {
  const anchorEl = useMemo<VirtualElement | null>(() => {
    if (!props.clientRect) return null
    return {
      getBoundingClientRect: () => props.clientRect!(),
    } as VirtualElement
  }, [props.clientRect])

  return (
    <FloatingPopover
      open={Boolean(props.open && anchorEl)}
      anchorEl={anchorEl}
      onClose={() => { /* 由外部生命周期控制关闭 */ }}
      placement="bottom"
    >
      <SlashCommandsList
        ref={ref}
        items={props.items}
        command={props.command}
        editor={props.editor}
      />
    </FloatingPopover>
  )
})

SlashCommandsOverlay.displayName = 'SlashCommandsOverlay'

export default SlashCommandsOverlay

