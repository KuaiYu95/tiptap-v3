import '@excalidraw/excalidraw/index.css'
import { Button } from '@mui/material'
import React, { useRef, useState } from 'react'

type ExcalidrawImperativeAPI = {
  getSceneElements: () => readonly any[]
  getAppState: () => any
  getFiles: () => any
  [key: string]: any
}

const ExcalidrawEditor = React.lazy(() => {
  return import('@excalidraw/excalidraw').then((module) => ({
    default: module.Excalidraw,
  }))
})

interface ExcalidrawEditorProps {
  onSave: (file: File) => void
  onClose: () => void
}

const ExcalidrawEditorWrapper: React.FC<ExcalidrawEditorProps> = ({
  onSave,
  onClose,
}) => {
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const handleSave = async () => {
    if (excalidrawAPIRef.current) {
      try {
        const elements = excalidrawAPIRef.current.getSceneElements()
        if (elements.length === 0) {
          return
        }
        const appState = excalidrawAPIRef.current.getAppState() as any
        const files = excalidrawAPIRef.current.getFiles()

        const excalidrawModule = await import('@excalidraw/excalidraw')
        const { exportToBlob } = excalidrawModule
        const blob = await exportToBlob({
          elements,
          appState: {
            ...appState,
            exportBackground: true,
            exportScale: 2,
          },
          files,
          mimeType: 'image/svg+xml',
        })

        const file = new File([blob], `excalidraw-${Date.now()}.svg`, { type: 'image/svg+xml' })
        onSave(file)
      } catch (error) {
        console.error('Failed to export Excalidraw as image', error)
      }
    } else {
      console.warn('Excalidraw API not available')
    }
  }

  return (
    <React.Suspense fallback={<div style={{ textAlign: 'center', padding: 16, fontSize: 12 }}>加载中...</div>}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <ExcalidrawEditor
          excalidrawAPI={(api) => {
            excalidrawAPIRef.current = api
            if (!isLoaded) {
              setIsLoaded(true)
            }
          }}
          onChange={() => {
            // 可以在这里实现自动保存逻辑
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            display: 'flex',
            gap: 8,
          }}
        >
          <Button variant="outlined" onClick={onClose}>
            取消
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={!isLoaded}>
            保存为图片导入
          </Button>
        </div>
      </div>
    </React.Suspense>
  )
}

export default ExcalidrawEditorWrapper
