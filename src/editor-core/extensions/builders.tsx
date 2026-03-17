import Highlight from '@tiptap/extension-highlight';
import InvisibleCharacters from '@tiptap/extension-invisible-characters';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import { PLACEHOLDER } from '../../constants/placeholder';
import { GetExtensionsProps } from '../../types';
import { ExtensionLayer } from './catalog';
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
  YoutubeExtension,
} from './node';

type ExtensionList = any[];
export type ExtensionLayerMap = Record<ExtensionLayer, ExtensionList>;

const createPlaceholderExtension = ({ placeholder }: GetExtensionsProps) =>
  Placeholder.configure({
    emptyNodeClass: 'custom-placeholder-node',
    showOnlyWhenEditable: true,
    showOnlyCurrent: true,
    includeChildren: true,
    placeholder: ({ editor, node, pos }) => {
      const { type, attrs } = node;
      if (pos === 0 && editor.isEmpty) {
        return placeholder || PLACEHOLDER.default;
      }
      const aiWritingEnabled = !!(editor as any)?.storage?.aiWriting?.enabled;
      if (!aiWritingEnabled) {
        if (type.name === 'heading') {
          return PLACEHOLDER.heading[attrs.level as keyof typeof PLACEHOLDER.heading];
        }
        if (PLACEHOLDER[type.name as keyof typeof PLACEHOLDER]) {
          return PLACEHOLDER[type.name as keyof typeof PLACEHOLDER] as string;
        }
      }
      return '';
    },
  });

export const createCoreExtensions = ({
  editable,
  exclude,
  limit,
  onError,
  onTocUpdate,
  onValidateUrl,
  onUpload,
  onUploadImgUrl,
  baseUrl = '',
  mermaidOptions,
  tableOfContentsOptions,
  placeholder,
}: GetExtensionsProps): ExtensionList => [
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
    trailingNode: editable ? undefined : false,
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
  ImageExtension({ baseUrl, onUpload, onUploadImgUrl, onError, onValidateUrl }),
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
  createPlaceholderExtension({ editable, placeholder } as GetExtensionsProps),
];

export const createOptionalCoreExtensions = ({
  exclude,
}: GetExtensionsProps): ExtensionList => {
  if (exclude?.includes('indent')) {
    return [];
  }

  return [
    Indent.configure({
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
    }),
  ];
};

export const createEditableExtensions = ({
  editable,
  exclude,
  onUpload,
  onAiWritingGetSuggestion,
}: GetExtensionsProps): ExtensionList => {
  if (!editable) {
    return [];
  }

  const extensions: ExtensionList = [];

  if (!exclude?.includes('fileHandler')) {
    extensions.push(FileHandlerExtension({ onUpload }));
    extensions.push(UploadProgressExtension);
  }

  if (!exclude?.includes('invisibleCharacters')) {
    extensions.push(InvisibleCharacters);
  }

  if (!exclude?.includes('slashCommands')) {
    extensions.push(SlashCommands);
  }

  if (!exclude?.includes('aiWriting') && onAiWritingGetSuggestion) {
    extensions.push(AiWritingExtension({ onAiWritingGetSuggestion }));
  }

  if (!exclude?.includes('excalidraw')) {
    extensions.push(ExcalidrawExtension({ onUpload }));
  }

  return extensions;
};

export const createReadonlyExtensions = ({
  editable,
  exclude,
}: GetExtensionsProps): ExtensionList => {
  if (editable || exclude?.includes('structuredDiff')) {
    return [];
  }

  return [StructuredDiffExtension];
};

export const createFeatureExtensions = ({
  exclude,
  mentionItems,
  onMentionFilter,
  youtubeOptions,
}: GetExtensionsProps): ExtensionList => {
  const extensions: ExtensionList = [];

  if (!exclude?.includes('mention') && ((mentionItems && mentionItems.length > 0) || onMentionFilter)) {
    extensions.push(MentionExtension({ mentionItems, onMentionFilter }));
  }

  if (!exclude?.includes('youtube')) {
    extensions.push(YoutubeExtension(youtubeOptions));
  }

  return extensions;
};

export const createCustomExtensions = ({
  extensions,
}: GetExtensionsProps): ExtensionList => {
  return extensions && extensions.length > 0 ? [...extensions] : [];
};

export const createExtensionLayers = (props: GetExtensionsProps): ExtensionLayerMap => ({
  core: createCoreExtensions(props),
  'optional-core': createOptionalCoreExtensions(props),
  editable: createEditableExtensions(props),
  readonly: createReadonlyExtensions(props),
  feature: createFeatureExtensions(props),
  custom: createCustomExtensions(props),
});

export const flattenExtensionLayers = (layers: ExtensionLayerMap): ExtensionList => [
  ...layers.core,
  ...layers['optional-core'],
  ...layers.editable,
  ...layers.readonly,
  ...layers.feature,
  ...layers.custom,
];
