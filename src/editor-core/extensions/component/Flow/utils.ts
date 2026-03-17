import mermaid, { type MermaidConfig } from 'mermaid'
import { v4 as uuidv4 } from 'uuid'


/**
 * 默认 mermaid 配置
 */
const defaultMermaidConfig: MermaidConfig = {
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  look: 'handDrawn', // 启用手绘效果
  suppressErrorRendering: true, // 抑制错误渲染，由应用层处理错误
}

/**
 * 全局 mermaid 配置
 */
let globalMermaidConfig: MermaidConfig | null = null

/**
 * 初始化 mermaid（只执行一次）
 * @param config 可选的 mermaid 配置，会与默认配置合并
 */
export const initMermaid = (config?: MermaidConfig) => {
  if (!globalMermaidConfig) {
    const mergedConfig = {
      ...defaultMermaidConfig,
      ...config,
      // 深度合并 flowchart 配置
      flowchart: {
        ...defaultMermaidConfig.flowchart,
        ...config?.flowchart,
      },
    }
    mermaid.initialize(mergedConfig)
    globalMermaidConfig = mergedConfig
  } else if (config) {
    // 如果已经初始化过，但传入了新配置，则更新配置
    const mergedConfig = {
      ...globalMermaidConfig,
      ...config,
      flowchart: {
        ...globalMermaidConfig.flowchart,
        ...config?.flowchart,
      },
    }
    mermaid.initialize(mergedConfig)
    globalMermaidConfig = mergedConfig
  }
}

/**
 * 获取当前 mermaid 配置
 */
export const getMermaidConfig = (): MermaidConfig | null => {
  return globalMermaidConfig
}

/**
 * 生成唯一的 mermaid 渲染 ID
 */
export const generateMermaidId = (prefix = 'mermaid'): string => {
  return `${prefix}-${uuidv4()}`
}

/**
 * 从 mermaid 渲染结果中提取 SVG
 */
export const extractSvgFromResult = (result: any): string => {
  return result.svg || result.svgCode || ''
}

