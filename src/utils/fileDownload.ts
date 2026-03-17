import JSZip from 'jszip'

export interface FileInfo {
  src: string
  filename?: string
}

/**
 * 原生下载函数，使用 a 标签的 download 属性
 */
const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'

  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  URL.revokeObjectURL(url)
}

// 支持的文件类型
type FileType = 'img' | 'video' | 'audio' | 'attachment'

// 文件类型对应的默认扩展名
const DEFAULT_EXTENSIONS: Record<FileType, string> = {
  img: '.jpg',
  video: '.mp4',
  audio: '.mp3',
  attachment: '.bin'
}

// 文件类型对应的默认文件名前缀
const DEFAULT_NAME_PREFIXES: Record<FileType, string> = {
  img: 'image',
  video: 'video',
  audio: 'audio',
  attachment: 'attachment'
}

const getFilenameFromUrl = (url: string, type?: string): string => {
  let pathname = ''

  try {
    // 尝试解析为完整URL
    const urlObj = new URL(url)
    pathname = urlObj.pathname
  } catch {
    // 如果URL解析失败，可能是相对路径，直接使用原始字符串
    pathname = url
  }

  // 从路径中提取文件名（处理绝对路径和相对路径）
  const filename = pathname.split('/').pop() || ''

  // 如果文件名为空或没有扩展名，且提供了类型信息，添加对应扩展名
  if ((!filename || !filename.includes('.')) && type && type in DEFAULT_EXTENSIONS) {
    const extension = DEFAULT_EXTENSIONS[type as FileType]
    const baseName = filename || 'file'
    return `${baseName}${extension}`
  }

  // 如果文件名为空，生成默认文件名
  if (!filename) {
    const timestamp = Date.now()
    if (type && type in DEFAULT_EXTENSIONS) {
      const prefix = DEFAULT_NAME_PREFIXES[type as FileType]
      const extension = DEFAULT_EXTENSIONS[type as FileType]
      return `${prefix}_${timestamp}${extension}`
    }
    return `file_${timestamp}`
  }

  return filename
}

/**
 * 下载单个文件
 */
export const downloadSingleFile = async (fileInfo: FileInfo, type?: string): Promise<void> => {
  try {
    const response = await fetch(fileInfo.src)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const blob = await response.blob()
    const filename = fileInfo.filename || getFilenameFromUrl(fileInfo.src, type)

    downloadFile(blob, filename)
  } catch (error) {
    console.error('下载文件失败:', error)
    throw new Error('下载文件失败，请检查文件链接是否有效')
  }
}

/**
 * 批量下载多个图片并打包为 ZIP
 */
export const downloadFilesAsZip = async (
  files: FileInfo[],
  type?: string,
): Promise<void> => {
  const zipFilename: string = `${type}s_${Date.now()}.zip`

  if (files.length === 0) {
    throw new Error('没有要下载的文件')
  }

  try {
    const zip = new JSZip()
    const usedFilenames = new Set<string>()

    const downloadPromises = files.map(async (fileInfo) => {
      try {
        const response = await fetch(fileInfo.src)
        if (!response.ok) {
          console.warn(`文件下载失败 (${response.status}): ${fileInfo.src}`)
          return null
        }

        const blob = await response.blob()
        let filename = fileInfo.filename || getFilenameFromUrl(fileInfo.src, type)

        let counter = 1
        const originalFilename = filename
        while (usedFilenames.has(filename)) {
          const extension = originalFilename.split('.').pop() || ''
          const baseName = extension ? originalFilename.replace(`.${extension}`, '') : originalFilename
          filename = `${baseName}_${counter}${extension ? `.${extension}` : ''}`
          counter++
        }
        usedFilenames.add(filename)

        return { filename, blob }
      } catch (error) {
        console.warn(`下载文件失败: ${fileInfo.src}`, error)
        return null
      }
    })

    const results = await Promise.all(downloadPromises)
    const successfulDownloads = results.filter(result => result !== null)

    if (successfulDownloads.length === 0) {
      throw new Error('所有文件下载失败')
    }

    successfulDownloads.forEach((result) => {
      if (result) {
        zip.file(result.filename, result.blob)
      }
    })

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    downloadFile(zipBlob, zipFilename)

    if (successfulDownloads.length < files.length) {
      const failedCount = files.length - successfulDownloads.length
      console.warn(`成功下载 ${successfulDownloads.length} 张文件，${failedCount} 张文件下载失败`)
    }
  } catch (error) {
    console.error('打包下载失败:', error)
    throw new Error('打包下载失败，请重试')
  }
}

/**
 * 智能下载图片 - 单张直接下载，多张打包下载
 */
export const downloadFiles = async (
  files: FileInfo[],
  type?: string
): Promise<void> => {
  if (files.length === 0) return
  if (files.length === 1) {
    await downloadSingleFile(files[0], type)
  } else {
    await downloadFilesAsZip(files, type)
  }
}
