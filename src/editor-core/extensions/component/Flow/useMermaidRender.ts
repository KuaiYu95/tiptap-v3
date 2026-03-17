import mermaid from 'mermaid'
import { useEffect, useRef, useState } from 'react'
import { extractSvgFromResult, generateMermaidId, initMermaid } from './utils'

interface UseMermaidRenderOptions {
  code: string
  onError?: (error: Error) => void
  showLoading?: boolean
  idPrefix?: string
}

interface UseMermaidRenderReturn {
  svgContent: string
  error: string | null
  loading: boolean
}

/**
 * 自定义 Hook：处理 Mermaid 流程图渲染
 */
export const useMermaidRender = ({
  code,
  onError,
  showLoading = true,
  idPrefix = 'mermaid',
}: UseMermaidRenderOptions): UseMermaidRenderReturn => {
  const [svgContent, setSvgContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(showLoading)
  const renderIdRef = useRef<string | null>(null)
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!code || !code.trim()) {
      setLoading(false)
      setSvgContent('')
      setError(null)
      return
    }

    // 初始化 mermaid
    initMermaid()

    const id = generateMermaidId(idPrefix)
    renderIdRef.current = id

    setLoading(showLoading)
    setError(null)
    setSvgContent('')

    let isCancelled = false

    const renderMermaid = async () => {
      try {
        if (isCancelled) {
          return
        }

        const codeToRender = code.trim()
        const result = await mermaid.render(id, codeToRender)
        const svg = extractSvgFromResult(result)

        if (isCancelled) {
          return
        }

        if (svg && svg.length > 0) {
          setSvgContent(svg)
          setError(null)
          setLoading(false)
        } else {
          throw new Error('Mermaid 流程图渲染结果为空，请检查流程图代码是否正确')
        }
      } catch (err) {
        if (isCancelled) return

        const errorMessage = (err as Error).message || 'Mermaid 流程图渲染失败'
        setError(errorMessage)
        setLoading(false)
        setSvgContent('')
        onError?.(err as Error)
      }
    }

    // 使用 requestAnimationFrame 确保 DOM 已准备好
    rafIdRef.current = requestAnimationFrame(() => {
      if (!isCancelled) {
        renderMermaid()
      }
    })

    return () => {
      isCancelled = true

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }

      renderIdRef.current = null
    }
  }, [code, onError, showLoading, idPrefix])

  return { svgContent, error, loading }
}

