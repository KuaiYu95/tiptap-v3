import { Content } from '@tiptap/core';
import { Editor } from '@tiptap/react'
import { formatFileSize, getFileType } from './file';

export { formatFileSize, getFileType };

const insertNodeAtPosition = (editor: Editor, pos: number, nodeContent: Content) => {
  editor.chain().focus().insertContentAt(pos, nodeContent).run();
};

// 获取文件图标
export const getFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'pdf':
      return '📄'
    case 'doc':
    case 'docx':
      return '📝'
    case 'xls':
    case 'xlsx':
      return '📊'
    case 'ppt':
    case 'pptx':
      return '📋'
    case 'zip':
    case 'rar':
    case '7z':
      return '🗜️'
    case 'txt':
      return '📄'
    case 'mp3':
    case 'wav':
    case 'flac':
      return '🎵'
    default:
      return '📎'
  }
}

// 插入图片内容
export const insertImageContent = (editor: Editor, url: string, pos: number) => {
  insertNodeAtPosition(editor, pos, {
    type: 'image',
    attrs: {
      src: url,
    },
  })
}

// 插入视频内容
export const insertVideoContent = (editor: Editor, url: string, pos: number) => {
  insertNodeAtPosition(editor, pos, {
    type: 'video',
    attrs: {
      src: url,
    },
  })
}

// 插入附件内容
export const insertAttachmentContent = (editor: Editor, url: string, fileName: string, fileSize: number, pos: number) => {
  const size = formatFileSize(fileSize)
  insertNodeAtPosition(editor, pos, {
    type: 'blockAttachment',
    attrs: {
      url,
      title: fileName,
      size,
    },
  })
}
