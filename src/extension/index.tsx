
import InvisibleCharacters from '@tiptap/extension-invisible-characters';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { CharacterCount } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import { GetExtensionsProps } from '../type';
import {
  CodeBlockLowlightExtension,
  DetailsContentExtension,
  DetailsExtension,
  DetailsSummaryExtension,
  EmojiExtension,
  FileHandlerExtension,
  ImageExtension,
  ListExtension,
  MathematicsExtension,
  MentionExtension,
  TableExtension,
  YoutubeExtension,
} from './node';

export const getExtensions = ({
  limit,
  exclude,
  youtube,
  editable,
  mentionItems,
  getMention,
  onUpload,
}: GetExtensionsProps) => {
  const defaultExtensions: any = [
    StarterKit.configure({
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
    CodeBlockLowlightExtension,
    ImageExtension,
    CharacterCount.configure({
      limit: limit ?? null,
    }),
    Subscript,
    Superscript,
    TextStyleKit,
  ]

  if (!exclude?.includes('mention') && (mentionItems && mentionItems.length > 0 || getMention)) {
    const Mention = MentionExtension({ mentionItems, getMention })
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
    const Mathematics = MathematicsExtension
    defaultExtensions.push(Mathematics)
  }

  if (!exclude?.includes('table')) {
    const Table = TableExtension({ editable })
    defaultExtensions.push(Table)
  }

  if (!exclude?.includes('list')) {
    const List = ListExtension
    defaultExtensions.push(List)
  }

  if (!exclude?.includes('youtube')) {
    const Youtube = YoutubeExtension(youtube)
    defaultExtensions.push(Youtube)
  }

  if (!exclude?.includes('fileHandler')) {
    const FileHandler = FileHandlerExtension({ onUpload })
    defaultExtensions.push(FileHandler)
  }

  if (!exclude?.includes('invisibleCharacters') && editable) {
    defaultExtensions.push(InvisibleCharacters)
  }

  return defaultExtensions
}