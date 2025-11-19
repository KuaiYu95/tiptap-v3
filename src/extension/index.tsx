
import Highlight from '@tiptap/extension-highlight';
import InvisibleCharacters from '@tiptap/extension-invisible-characters';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import { PLACEHOLDER } from '../contants/placeholder';
import { GetExtensionsProps } from '../type';
import { AiWritingExtension, SlashCommands, StructuredDiffExtension } from './extension';
import { CodeExtension } from './mark/Code';
import {
  AlertExtension,
  AudioExtension,
  BlockAttachmentExtension,
  BlockLinkExtension,
  CodeBlockLowlightExtension,
  CustomBlockMathExtension,
  CustomHorizontalRule,
  CustomInlineMathExtension,
  CustomSubscript,
  CustomSuperscript,
  DetailsContentExtension,
  DetailsExtension,
  DetailsSummaryExtension,
  EmojiExtension,
  FileHandlerExtension,
  FlowExtension,
  IframeExtension,
  ImageExtension,
  Indent,
  InlineAttachmentExtension,
  InlineLinkExtension,
  InlineUploadProgressExtension,
  ListExtension,
  MentionExtension,
  TableHandleExtension,
  TableKit,
  TableOfContentsExtension,
  UploadProgressExtension,
  VerticalAlign,
  VideoExtension,
  YamlFormat,
  YoutubeExtension
} from './node';

export const getExtensions = ({
  contentType,
  limit,
  exclude,
  extensions: extensionsProps,
  youtube,
  editable,
  mentionItems,
  onMentionFilter,
  onUpload,
  onError,
  onTocUpdate,
  onAiWritingGetSuggestion,
  onValidateUrl,
}: GetExtensionsProps) => {
  const defaultExtensions: any = [
    StarterKit.configure({
      link: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
      listItem: false,
      orderedList: false,
      bulletList: false,
      listKeymap: false,
      undoRedo: exclude?.includes('undoRedo') ? false : undefined,
      dropcursor: {
        color: 'var(--mui-palette-primary-main)',
        width: 2,
      },
    }),
    TextStyleKit,
    CodeExtension,
    ListExtension,
    EmojiExtension,
    AlertExtension,
    CustomSubscript,
    DetailsExtension,
    CustomSuperscript,
    DetailsContentExtension,
    DetailsSummaryExtension,
    CodeBlockLowlightExtension,
    InlineUploadProgressExtension,
    YamlFormat,
    InlineLinkExtension,
    BlockLinkExtension,
    CustomHorizontalRule,
    IframeExtension({ onError, onValidateUrl }),
    VideoExtension({ onUpload, onError, onValidateUrl }),
    AudioExtension({ onUpload, onError, onValidateUrl }),
    TableKit.configure({
      table: {
        resizable: true,
        cellMinWidth: 120,
      },
    }),
    TableHandleExtension,
    TableOfContentsExtension({ onTocUpdate }),
    ImageExtension({ onUpload, onError, onValidateUrl }),
    CustomBlockMathExtension({ onError }),
    CustomInlineMathExtension({ onError }),
    InlineAttachmentExtension({ onUpload, onError }),
    BlockAttachmentExtension({ onUpload, onError }),
    Highlight.configure({ multicolor: true }),
    CharacterCount.configure({ limit: limit ?? null }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    VerticalAlign.configure({ types: ['textStyle'], defaultAlignment: null }),
    Placeholder.configure({
      emptyNodeClass: 'custom-placeholder-node',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
      includeChildren: true,
      placeholder: ({ editor, node, pos }) => {
        const { type, attrs } = node
        if (pos === 0 && editor.isEmpty) {
          return PLACEHOLDER.default
        }
        const aiWritingEnabled = !!(editor as any)?.storage?.aiWriting?.enabled
        if (!aiWritingEnabled) {
          if (type.name === 'heading') {
            return PLACEHOLDER.heading[attrs.level as keyof typeof PLACEHOLDER.heading]
          }
          if (PLACEHOLDER[type.name as keyof typeof PLACEHOLDER]) {
            return PLACEHOLDER[type.name as keyof typeof PLACEHOLDER] as string
          }
        }
        return ''
      },
    }),
  ]

  if (contentType === 'markdown') {
    defaultExtensions.push(
      Markdown.configure({
        indentation: {
          style: 'space',
          size: 2,
        },
        markedOptions: {
          gfm: true,
          breaks: false,
          pedantic: false,
        },
      })
    )
  }

  if (!exclude?.includes('indent')) {
    defaultExtensions.push(Indent.configure({
      types: [
        'paragraph', 'heading', 'blockquote', 'alert', 'codeBlock', 'horizontalRule',
        'orderedList', 'bulletList', 'taskList', 'taskItem', 'listItem',
        'details', 'detailsContent', 'detailsSummary',
        'table',
        'image', 'video', 'audio', 'iframe', 'flow',
        'blockAttachment', 'inlineAttachment', 'blockLink',
        'blockMath', 'inlineMath',
      ],
      maxLevel: 8,
      indentPx: 32,
    }))
  }

  if (editable) { // 编辑模式
    if (!exclude?.includes('fileHandler')) {
      const FileHandler = FileHandlerExtension({ onUpload })
      defaultExtensions.push(FileHandler)
      const UploadProgress = UploadProgressExtension
      defaultExtensions.push(UploadProgress)
    }

    if (!exclude?.includes('invisibleCharacters')) {
      defaultExtensions.push(InvisibleCharacters)
    }

    if (!exclude?.includes('slashCommands')) {
      defaultExtensions.push(SlashCommands)
    }

    if (!exclude?.includes('aiWriting') && onAiWritingGetSuggestion) {
      defaultExtensions.push(AiWritingExtension({ onAiWritingGetSuggestion }))
    }
  } else { // 只读模式
    if (!exclude?.includes('structuredDiff')) {
      defaultExtensions.push(StructuredDiffExtension)
    }
  }

  if (!exclude?.includes('mention') && (mentionItems && mentionItems.length > 0 || onMentionFilter)) {
    const Mention = MentionExtension({ mentionItems, onMentionFilter })
    defaultExtensions.push(Mention)
  }

  if (!exclude?.includes('youtube')) {
    const Youtube = YoutubeExtension(youtube)
    defaultExtensions.push(Youtube)
  }

  if (!exclude?.includes('flow')) {
    defaultExtensions.push(FlowExtension({ onError }))
  }

  if (extensionsProps && extensionsProps.length > 0) {
    defaultExtensions.push(...extensionsProps)
  }

  return defaultExtensions
}
