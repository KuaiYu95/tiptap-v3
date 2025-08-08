
import InvisibleCharacters from '@tiptap/extension-invisible-characters';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import { PLACEHOLDER } from '../contants/placeholder';
import { GetExtensionsProps } from '../type';
import {
  BlockAttachmentExtension,
  BlockLinkExtension,
  CodeBlockLowlightExtension,
  CustomBlockMathExtension,
  CustomInlineMathExtension,
  DetailsContentExtension,
  DetailsExtension,
  DetailsSummaryExtension,
  EmojiExtension,
  FileHandlerExtension,
  ImageExtension,
  InlineAttachmentExtension,
  InlineLinkExtension,
  ListExtension,
  MentionExtension,
  TableExtension,
  TableOfContents,
  UploadProgressExtension,
  VideoExtension,
  YoutubeExtension
} from './node';

export const getExtensions = ({
  limit,
  exclude,
  youtube,
  editable,
  mentionItems,
  onMentionFilter,
  onUpload,
  onError,
  onTocUpdate,
}: GetExtensionsProps) => {
  const defaultExtensions: any = [
    StarterKit.configure({
      link: false,
      codeBlock: false,
      listItem: false,
      orderedList: false,
      bulletList: false,
      listKeymap: false,
      dropcursor: {
        color: 'var(--mui-palette-primary-main)',
        width: 2,
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    CodeBlockLowlightExtension,
    CharacterCount.configure({
      limit: limit ?? null,
    }),
    Subscript,
    Superscript,
    TextStyleKit,
    Placeholder.configure({
      emptyNodeClass: 'custom-placeholder-node',
      showOnlyWhenEditable: true,
      placeholder: ({ node, pos }) => {
        const { type, attrs } = node
        if (pos === 0) {
          return PLACEHOLDER.default
        }
        if (type.name === 'heading') {
          return PLACEHOLDER.heading[attrs.level as keyof typeof PLACEHOLDER.heading]
        }
        if (PLACEHOLDER[type.name as keyof typeof PLACEHOLDER]) {
          return PLACEHOLDER[type.name as keyof typeof PLACEHOLDER] as string
        }
        return ''
      },
    }),
  ]

  if (!exclude?.includes('mention') && (mentionItems && mentionItems.length > 0 || onMentionFilter)) {
    const Mention = MentionExtension({ mentionItems, onMentionFilter })
    defaultExtensions.push(Mention)
  }

  if (!exclude?.includes('details')) {
    const Details = DetailsExtension
    const DetailsContent = DetailsContentExtension
    const DetailsSummary = DetailsSummaryExtension
    defaultExtensions.push(Details)
    defaultExtensions.push(DetailsContent)
    defaultExtensions.push(DetailsSummary)
  }

  if (!exclude?.includes('emoji')) {
    const Emoji = EmojiExtension
    defaultExtensions.push(Emoji)
  }

  if (!exclude?.includes('mathematics')) {
    const CustomInlineMath = CustomInlineMathExtension({ onError })
    const CustomBlockMath = CustomBlockMathExtension({ onError })
    defaultExtensions.push(CustomInlineMath)
    defaultExtensions.push(CustomBlockMath)
  }

  if (!exclude?.includes('table')) {
    const Table = TableExtension({ editable })
    defaultExtensions.push(...Table)
  }

  if (!exclude?.includes('list')) {
    const List = ListExtension
    defaultExtensions.push(List)
  }

  if (!exclude?.includes('video')) {
    const Video = VideoExtension({ onUpload, onError })
    defaultExtensions.push(Video)
  }

  if (!exclude?.includes('image')) {
    const Image = ImageExtension({ onUpload, onError })
    defaultExtensions.push(Image)
  }

  if (!exclude?.includes('youtube')) {
    const Youtube = YoutubeExtension(youtube)
    defaultExtensions.push(Youtube)
  }

  if (!exclude?.includes('fileHandler')) {
    const FileHandler = FileHandlerExtension({ onUpload })
    defaultExtensions.push(FileHandler)
    const UploadProgress = UploadProgressExtension
    defaultExtensions.push(UploadProgress)
  }

  if (!exclude?.includes('invisibleCharacters') && editable) {
    defaultExtensions.push(InvisibleCharacters)
  }

  if (!exclude?.includes('link')) {
    defaultExtensions.push(InlineLinkExtension)
    defaultExtensions.push(BlockLinkExtension)
  }

  if (!exclude?.includes('attachment')) {
    const InlineAttachment = InlineAttachmentExtension({ onUpload, onError })
    const BlockAttachment = BlockAttachmentExtension({ onUpload, onError })
    defaultExtensions.push(InlineAttachment)
    defaultExtensions.push(BlockAttachment)
  }

  if (!exclude?.includes('tableOfContents')) {
    const CustomTableOfContents = TableOfContents({ onTocUpdate })
    defaultExtensions.push(CustomTableOfContents)
  }

  return defaultExtensions
}