
import Highlight from '@tiptap/extension-highlight';
import InvisibleCharacters from '@tiptap/extension-invisible-characters';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import { PLACEHOLDER } from '../contants/placeholder';
import { GetExtensionsProps } from '../type';
import { AiWritingExtension, ImeComposition, SlashCommands, StructuredDiffExtension } from './extension';
import { CodeExtension } from './mark/Code';
import Tooltip from './mark/Tooltip';
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
  ExcalidrawExtension,
  FileHandlerExtension,
  FlipGridColumnExtension,
  FlipGridExtension,
  FlowExtension,
  IframeExtension,
  ImageExtension,
  Indent,
  InlineAttachmentExtension,
  InlineLinkExtension,
  InlineUploadProgressExtension,
  ListExtension,
  MentionExtension,
  TableExtension,
  TableOfContents,
  UploadProgressExtension,
  VerticalAlign,
  VideoExtension,
  YamlFormat,
  YoutubeExtension
} from './node';

export const getExtensions = ({
  limit,
  exclude,
  extensions: extensionsProps,
  editable,
  mentionItems,
  baseUrl = '',
  onMentionFilter,
  onUpload,
  onError,
  onTocUpdate,
  onAiWritingGetSuggestion,
  onValidateUrl,
  placeholder,
  mermaidOptions,
  youtubeOptions,
  tableOfContentsOptions,
}: GetExtensionsProps) => {
  const defaultExtensions: any = [
    ImeComposition,
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
    YamlFormat,
    TextStyleKit,
    CodeExtension,
    Tooltip,
    ListExtension,
    EmojiExtension,
    AlertExtension,
    CustomSubscript,
    DetailsExtension,
    CustomSuperscript,
    FlipGridExtension,
    DetailsContentExtension,
    DetailsSummaryExtension,
    CodeBlockLowlightExtension,
    InlineUploadProgressExtension,
    CustomHorizontalRule,
    FlipGridColumnExtension,
    ...TableExtension({ editable }),
    FlowExtension({ mermaidOptions }),
    CustomBlockMathExtension({ onError }),
    CustomInlineMathExtension({ onError }),
    TableOfContents({ onTocUpdate, tableOfContentsOptions }),
    InlineLinkExtension,
    BlockLinkExtension,
    IframeExtension({ onError, onValidateUrl }),
    VideoExtension({ baseUrl, onUpload, onError, onValidateUrl }),
    AudioExtension({ baseUrl, onUpload, onError, onValidateUrl }),
    ImageExtension({ baseUrl, onUpload, onError, onValidateUrl }),
    InlineAttachmentExtension({ baseUrl, onUpload, onError }),
    BlockAttachmentExtension({ baseUrl, onUpload, onError }),
    Highlight.configure({ multicolor: true }),
    CharacterCount.configure({ limit: limit ?? null }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
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
    }),
    VerticalAlign.configure({ types: ['textStyle'], defaultAlignment: null }),
    Placeholder.configure({
      emptyNodeClass: 'custom-placeholder-node',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
      includeChildren: true,
      placeholder: ({ editor, node, pos }) => {
        const { type, attrs } = node
        if (pos === 0 && editor.isEmpty) {
          return placeholder || PLACEHOLDER.default
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

    if (!exclude?.includes('excalidraw')) {
      defaultExtensions.push(ExcalidrawExtension({ onUpload }))
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
    const Youtube = YoutubeExtension(youtubeOptions)
    defaultExtensions.push(Youtube)
  }

  if (extensionsProps && extensionsProps.length > 0) {
    defaultExtensions.push(...extensionsProps)
  }

  return defaultExtensions
}
