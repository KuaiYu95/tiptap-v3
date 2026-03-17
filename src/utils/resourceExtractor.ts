import { NodeTypeEnum } from '../constants/enums'
import { Node } from '@tiptap/pm/model'

/**
 * 文件资源类型映射
 */
const FILE_RESOURCE_TYPES = new Set([
  NodeTypeEnum.Video,
  NodeTypeEnum.Audio,
  NodeTypeEnum.Image,
  NodeTypeEnum.InlineAttachment,
  NodeTypeEnum.BlockAttachment
])

/**
 * 递归遍历节点，获取所有文件资源
 * @param node - 要遍历的节点
 * @param path - 当前节点路径
 * @returns 文件资源数组
 */
function extractResourcesFromNode(node: Node, path: number[] = []): Node[] {
  const resources: Node[] = []

  // 检查当前节点是否为文件资源
  if (FILE_RESOURCE_TYPES.has(node.type.name as NodeTypeEnum)) {
    const src = node.attrs?.src || node.attrs?.url
    if (src) {
      resources.push(node)
    }
  }

  // 递归遍历子节点
  if (node.content) {
    node.content.forEach((childNode, index) => {
      const childPath = [...path, index]
      resources.push(...extractResourcesFromNode(childNode, childPath))
    })
  }

  return resources
}

/**
 * 从编辑器内容中递归获取所有文件资源
 * @param content - 编辑器内容节点
 * @returns 所有文件资源数组
 */
export function getAllResources(content: Node): Node[] {
  return extractResourcesFromNode(content)
}

/**
 * 根据资源类型筛选资源
 * @param resources - 文件资源数组
 * @param types - 要筛选的资源类型
 * @returns 筛选后的资源数组
 */
export function filterResourcesByType(
  resources: Node[],
  types: NodeTypeEnum[]
): Node[] {
  return resources.filter(resource => types.includes(resource.type.name as NodeTypeEnum))
}
