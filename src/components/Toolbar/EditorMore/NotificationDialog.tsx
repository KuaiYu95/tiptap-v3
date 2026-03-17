import { SHORTCUT_KEYS } from "../../../constants/shortcut-key"
import { getShortcutKeyText } from "../../../utils"
import { Box, Dialog, DialogContent, DialogTitle, Stack } from "@mui/material"
import React from "react"

interface NotificationDialogProps {
  open: boolean
  onClose: () => void
}

const NotificationDialog = ({ open, onClose }: NotificationDialogProps) => {
  return <Dialog open={open} onClose={onClose}>
    <DialogTitle>快捷键</DialogTitle>
    <DialogContent>
      {Object.entries(SHORTCUT_KEYS).map(([key, value]) => {
        return <Box key={key} sx={{
          mb: 3,
          '&:last-child': {
            mb: 0,
          }
        }}>
          <Box sx={{ fontSize: '1rem', fontWeight: 'bold', mb: 1, textAlign: 'center' }}>{value.label}</Box>
          <Stack gap={0.25}>
            {value.keys.map((it) => {
              return <Stack direction={'row'} alignItems={'center'} key={it.value} sx={{
                py: 1,
                px: 2,
                bgcolor: 'background.paper',
                borderRadius: 'var(--mui-shape-borderRadius)',
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}>
                <Box sx={{ fontSize: '0.875rem', width: '450px' }}>
                  {it.label}
                  <Box component={'span'} sx={{ fontSize: '0.75rem', color: 'text.secondary', ml: 1 }}>({it.value})</Box>
                </Box>
                <Box sx={{ fontSize: '0.875rem', width: '150px' }}>{getShortcutKeyText(it.keys)}</Box>
              </Stack>
            })}
          </Stack>
        </Box>
      })}
    </DialogContent>
  </Dialog>
}

export default NotificationDialog
