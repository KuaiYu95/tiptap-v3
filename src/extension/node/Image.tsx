import { EditorFnProps } from "@ctzhian/tiptap/type";
import { getFileType, removeBaseUrl, withBaseUrl } from "@ctzhian/tiptap/util";
import Image from "@tiptap/extension-image";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { generateJSON } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import ImageViewWrapper, { getImageDimensionsFromFile } from "../component/Image";

export type ImageExtensionProps = EditorFnProps & { baseUrl: string }

/** 从 URL 下载图片并转换为 File 对象 */
async function downloadImageAsFile(url: string, index: number): Promise<File | null> {
  try {
    // console.log(`[下载] 开始下载图片 ${index + 1}: ${url.substring(0, 100)}`);
    
    // 尝试不带 credentials 下载
    let response = await fetch(url, { 
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      // console.warn(`[下载] 图片 ${index + 1} 直接下载失败 (${response.status})，尝试无限制模式`);
      // 再试一次，允许跨域
      response = await fetch(url, { mode: 'no-cors' });
      if (response.type === 'opaque') {
        console.error(`[图片下载] 图片 ${index + 1} 被CORS阻止，无法下载`);
        return null;
      }
    }
    
    const blob = await response.blob();
    if (blob.size === 0) {
      console.error(`[图片下载] 图片 ${index + 1} blob为空`);
      return null;
    }
    
    const fileName = `image-${index + 1}.${blob.type.split('/')[1] || 'png'}`;
    const file = new File([blob], fileName, { type: blob.type });
    // console.log(`[下载] 图片 ${index + 1} 下载成功:`, { name: file.name, type: file.type, size: file.size });
    return file;
  } catch (error) {
    console.error(`[图片下载] 图片 ${index + 1} 下载异常:`, error);
    return null;
  }
}

/** 解码 HTML 实体 */
function decodeHTMLEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

/** 从 HTML 中提取所有 img 标签的 src */
function extractImageUrls(html: string): string[] {
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const urls: string[] = [];
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    let src = match[1];
    // 解码HTML实体（如 &amp; -> &）
    src = decodeHTMLEntities(src);
    // 过滤掉 base64 和无效 URL
    if (src && !src.startsWith('data:') && (src.startsWith('http') || src.startsWith('//'))) {
      urls.push(src.startsWith('//') ? `https:${src}` : src);
    }
  }
  return urls;
}

/** 在 JSON 结构中用 progress 节点替换 image 节点，按顺序匹配 Files */
function replaceImagesWithProgressNodes(
  node: JSONContent,
  imageFiles: File[],
  fileIndex: { current: number },
  tempIds: string[]
): JSONContent {
  if (node.type === 'image' && fileIndex.current < imageFiles.length) {
    const idx = fileIndex.current++;
    const tempId = `upload-${Date.now()}-${idx}`;
    tempIds.push(tempId);
    return {
      type: 'inlineUploadProgress',
      attrs: {
        fileName: imageFiles[idx].name,
        fileType: 'image',
        progress: 0,
        tempId,
      },
    };
  }
  if (node.content && Array.isArray(node.content)) {
    return {
      ...node,
      content: node.content.map(child =>
        replaceImagesWithProgressNodes(child, imageFiles, fileIndex, tempIds)
      ),
    };
  }
  return node;
}

/** 在 doc 末尾追加多余的图片（当 Files 数量多于 HTML 中的 img 时） */
function appendExtraImagesToDoc(
  doc: JSONContent,
  imageFiles: File[],
  startIndex: number,
  tempIds: string[]
): JSONContent {
  const content = [...(doc.content || [])];
  for (let i = startIndex; i < imageFiles.length; i++) {
    const tempId = `upload-${Date.now()}-${i}`;
    tempIds.push(tempId);
    const progressNode = {
      type: 'inlineUploadProgress',
      attrs: {
        fileName: imageFiles[i].name,
        fileType: 'image',
        progress: 0,
        tempId,
      },
    };
    content.push({ type: 'paragraph', content: [progressNode] });
  }
  return { ...doc, content };
}

const customImage = (props: ImageExtensionProps) => Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: element => withBaseUrl(element.getAttribute('src') || '', props.baseUrl),
        renderHTML: attributes => {
          if (!attributes.src) return {}
          return { src: removeBaseUrl(attributes.src, props.baseUrl) }
        },
      },
    }
  },
  addKeyboardShortcuts() {
    return {
      'Mod-2': () => {
        return this.editor.commands.setImage({ src: '', width: 760 })
      }
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer((renderProps) => ImageViewWrapper({
      ...renderProps,
      onUpload: props.onUpload,
      onError: props.onError,
      onValidateUrl: props.onValidateUrl
    }))
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imagePasteHandler'),
        props: {
          handlePaste: (view, event) => {
            if (!props.onUpload) return false;

            const items = Array.from(event.clipboardData?.items || []);
            const imageFiles = items
              .map(item => item.getAsFile())
              .filter((file): file is File => file !== null && getFileType(file) === 'image');

            const htmlData = event.clipboardData?.getData('text/html');

            // 提前声明变量和函数，避免在异步回调中出现 TDZ 错误
            const { from, to } = view.state.selection;
            const editor = this.editor;

            // 定义辅助函数
            const findNodePosition = (typeName: string, tempId: string) => {
              let targetPos: number | null = null;
              editor.state.doc.descendants((node, position) => {
                if (node.type.name === typeName && node.attrs.tempId === tempId) {
                  targetPos = position;
                  return false;
                }
                return undefined;
              });
              return targetPos;
            };

            const uploadSingleImage = async (file: File, tempId: string) => {
              try {
                const progressPos = findNodePosition('inlineUploadProgress', tempId);
                
                const url = await props.onUpload!(file, (progressEvent) => {
                  editor.chain().updateInlineUploadProgress(tempId, progressEvent.progress).focus().run();
                });

                editor.chain().removeInlineUploadProgress(tempId).focus().run();

                const chain = editor.chain().focus();
                if (progressPos !== null) {
                  chain.setTextSelection(progressPos);
                }

                try {
                  const dimensions = await getImageDimensionsFromFile(file);
                  chain.setImage({
                    src: url,
                    width: Math.min(dimensions.width, 760)
                  }).run();
                } catch (error) {
                  const fallbackChain = editor.chain().focus();
                  if (progressPos !== null) {
                    fallbackChain.setTextSelection(progressPos);
                  }
                  fallbackChain.setImage({ src: url, width: 760 }).run();
                }
              } catch (error) {
                console.error(`[图片上传] ${file.name} 上传失败:`, error);
                editor.chain().removeInlineUploadProgress(tempId).focus().run();
                const progressPos = findNodePosition('inlineUploadProgress', tempId);
                const chain = editor.chain().focus();
                if (progressPos !== null) {
                  chain.setTextSelection(progressPos);
                }
                chain.setImage({ src: '', width: 760 }).run();
              }
            };

            const processImagePaste = async (files: File[], html: string | undefined, fromPos: number, toPos: number) => {
              if (!props.onUpload) return;

              const htmlTrimmed = html?.trim() || '';
              const hasRichHtml = htmlTrimmed.length > 0 && (
                htmlTrimmed.includes('<p') ||
                htmlTrimmed.includes('<div') ||
                htmlTrimmed.includes('<br') ||
                htmlTrimmed.includes('<span') ||
                (htmlTrimmed.match(/<img/gi)?.length !== 1)
              );

              if (hasRichHtml) {
                try {
                  const extensions = editor.extensionManager.extensions;
                  const parsed = generateJSON(htmlTrimmed, extensions);
                  
                  if (!parsed?.content?.length) throw new Error('Empty parsed content');

                  const tempIds: string[] = [];
                  const fileIndex = { current: 0 };
                  const modifiedDoc = replaceImagesWithProgressNodes(parsed, files, fileIndex, tempIds);
                  const finalDoc = appendExtraImagesToDoc(modifiedDoc, files, fileIndex.current, tempIds);

                  editor.chain().insertContentAt({ from: fromPos, to: toPos }, finalDoc).focus().run();

                  for (let i = 0; i < tempIds.length; i++) {
                    await uploadSingleImage(files[i], tempIds[i]);
                  }
                } catch (error) {
                  console.error('[图片粘贴] 富文本解析失败，使用简单插入:', error);
                  useSimpleInsert(files, fromPos, toPos);
                }
              } else {
                useSimpleInsert(files, fromPos, toPos);
              }

              function useSimpleInsert(files: File[], fromPos: number, toPos: number) {
                const baseTime = Date.now();
                const content = files.map((file, i) => ({
                  type: 'paragraph',
                  content: [{
                    type: 'inlineUploadProgress',
                    attrs: {
                      fileName: file.name,
                      fileType: 'image',
                      progress: 0,
                      tempId: `upload-${baseTime}-${i}`,
                    },
                  }],
                }));
                editor.chain().insertContentAt({ from: fromPos, to: toPos }, content).focus().run();
                files.forEach((file, i) => {
                  const tempId = `upload-${baseTime}-${i}`;
                  uploadSingleImage(file, tempId);
                });
              }
            };

            // 如果没有 File 对象，尝试从 HTML 中提取图片 URL
            let finalImageFiles = imageFiles;
            if (imageFiles.length === 0 && htmlData) {
              const imageUrls = extractImageUrls(htmlData);
              
              if (imageUrls.length > 0) {
                event.preventDefault(); // 阻止默认粘贴行为
                
                // 异步下载所有图片
                (async () => {
                  const downloadedFiles = await Promise.all(
                    imageUrls.map((url, i) => downloadImageAsFile(url, i))
                  );
                  const validFiles = downloadedFiles.filter((f): f is File => f !== null);
                  
                  if (validFiles.length === 0) {
                    // console.log('[图片粘贴] 下载失败，使用降级方案：保留原图URL');
                    
                    // 降级方案：直接粘贴原始HTML，使用原图URL
                    try {
                      const extensions = editor.extensionManager.extensions;
                      const parsed = generateJSON(htmlData, extensions);
                      if (parsed?.content?.length) {
                        editor.chain().insertContentAt({ from, to }, parsed).focus().run();
                      } else {
                        throw new Error('解析失败');
                      }
                    } catch (error) {
                      // 最后兜底：返回false让浏览器处理默认粘贴
                      return;
                    }
                    return;
                  }
                  
                  // 使用下载的文件继续处理
                  await processImagePaste(validFiles, htmlData, from, to);
                })();
                
                return true; // 已处理
              } else {
                return false;
              }
            }
            
            if (imageFiles.length === 0) {
              return false;
            }
            
            if (htmlData && htmlData.trim().length > 0) {
              const htmlLower = htmlData.toLowerCase();
              if (htmlLower.includes('<table') ||
                htmlLower.includes('<tr') ||
                htmlLower.includes('<td') ||
                htmlLower.includes('<th')) {
                return false;
              }
            }

            // 如果有 File 对象，直接处理
            if (finalImageFiles.length > 0) {
              (async () => {
                await processImagePaste(finalImageFiles, htmlData, from, to);
              })();
            }

            return true;
          }
        }
      })
    ];
  }
})

export const ImageExtension = (props: ImageExtensionProps) => customImage(props).configure({
  inline: true,
  allowBase64: true,
});
