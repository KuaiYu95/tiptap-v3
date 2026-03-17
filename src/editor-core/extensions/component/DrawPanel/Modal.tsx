import { Box, Dialog, DialogContent } from '@mui/material'
import React from 'react'
import ExcalidrawEditor from './ExcalidrawEditor'

interface ExcalidrawModalProps {
  open: boolean
  onClose: () => void
  onSave: (file: File) => void
}

const ExcalidrawModal: React.FC<ExcalidrawModalProps> = ({ open, onClose, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogContent sx={{ pt: 2, p: 0, overflow: 'hidden' }}>
        <Box sx={{ width: '100%', height: '90vh', position: 'relative', overflow: 'hidden' }}>
          <ExcalidrawEditor onSave={onSave} onClose={onClose} />
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ExcalidrawModal
