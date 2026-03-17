export type ExtensionLayer =
  | 'core'
  | 'optional-core'
  | 'editable'
  | 'readonly'
  | 'feature'
  | 'custom';

export type ExtensionMaintenanceType =
  | 'official-core'
  | 'official-wrapper'
  | 'compat-patch'
  | 'business-extension'
  | 'product-support';

export type ExtensionUpgradeDecision =
  | 'carry-forward'
  | 'adopted-upstream'
  | 'partially-aligned'
  | 'needs-follow-up';

export type NextUpgradeAction =
  | 'try-remove'
  | 'review-only'
  | 'keep-business';

export interface ExtensionCatalogItem {
  id: string;
  layer: ExtensionLayer;
  maintenanceType: ExtensionMaintenanceType;
  upgradeDecision?: ExtensionUpgradeDecision;
  nextUpgradeAction?: NextUpgradeAction;
  reviewedForVersion?: string;
  decisionNotes?: string[];
  upstreamPackage?: string;
  files: string[];
  rationale: string;
  reviewOnUpgrade: string[];
}

export const TIPTAP_EXTENSION_CATALOG: ExtensionCatalogItem[] = [
  {
    id: 'StarterKit',
    layer: 'core',
    maintenanceType: 'official-core',
    upstreamPackage: '@tiptap/starter-kit',
    files: ['src/extension/builders.tsx'],
    rationale: 'Core upstream bundle kept as the editor baseline.',
    reviewOnUpgrade: ['Check disabled sub-extensions and StarterKit defaults.'],
  },
  {
    id: 'Markdown',
    layer: 'core',
    maintenanceType: 'official-core',
    upgradeDecision: 'partially-aligned',
    reviewedForVersion: '3.20.2',
    decisionNotes: ['Markdown runtime is upgraded to 3.20.2.', 'Local markdown editor synchronization and fenced-code fallbacks are still intentionally retained.'],
    upstreamPackage: '@tiptap/markdown',
    files: ['src/extension/builders.tsx', 'src/EditorMarkdown/index.tsx'],
    rationale: 'Upstream markdown parser/serializer used directly.',
    reviewOnUpgrade: ['Re-run markdown roundtrip tests and empty paragraph scenarios.'],
  },
  {
    id: 'Highlight',
    layer: 'core',
    maintenanceType: 'official-wrapper',
    upstreamPackage: '@tiptap/extension-highlight',
    files: ['src/extension/builders.tsx'],
    rationale: 'Thin configuration wrapper over upstream highlight.',
    reviewOnUpgrade: ['Check mark compatibility and multicolor behavior.'],
  },
  {
    id: 'TextAlign',
    layer: 'core',
    maintenanceType: 'official-wrapper',
    upstreamPackage: '@tiptap/extension-text-align',
    files: ['src/extension/builders.tsx'],
    rationale: 'Thin wrapper for paragraph/heading alignment.',
    reviewOnUpgrade: ['Check command names and supported node types.'],
  },
  {
    id: 'CharacterCount',
    layer: 'core',
    maintenanceType: 'official-wrapper',
    upstreamPackage: '@tiptap/extensions',
    files: ['src/extension/builders.tsx'],
    rationale: 'Upstream extension configured with local limits.',
    reviewOnUpgrade: ['Confirm storage shape and limit behavior.'],
  },
  {
    id: 'Placeholder',
    layer: 'core',
    maintenanceType: 'official-wrapper',
    upstreamPackage: '@tiptap/extensions',
    files: ['src/extension/builders.tsx'],
    rationale: 'Upstream placeholder with local placeholder mapping.',
    reviewOnUpgrade: ['Check placeholder callback signature and storage access.'],
  },
  {
    id: 'InvisibleCharacters',
    layer: 'editable',
    maintenanceType: 'official-core',
    upstreamPackage: '@tiptap/extension-invisible-characters',
    files: ['src/extension/builders.tsx'],
    rationale: 'Pure upstream editing helper.',
    reviewOnUpgrade: ['Check storage typings and display defaults.'],
  },
  {
    id: 'CodeExtension',
    layer: 'core',
    maintenanceType: 'compat-patch',
    upgradeDecision: 'needs-follow-up',
    nextUpgradeAction: 'try-remove',
    reviewedForVersion: '3.20.2',
    decisionNotes: ['Still required locally after the 3.20.2 upgrade.'],
    upstreamPackage: '@tiptap/extension-code',
    files: ['src/extension/mark/Code.tsx', 'src/extension/builders.tsx'],
    rationale: 'Overrides upstream mark excludes so code can coexist with textStyle marks.',
    reviewOnUpgrade: ['Compare with upstream code mark behavior and remove if officially supported.'],
  },
  {
    id: 'ImeComposition',
    layer: 'core',
    maintenanceType: 'compat-patch',
    upgradeDecision: 'carry-forward',
    nextUpgradeAction: 'review-only',
    reviewedForVersion: '3.20.2',
    decisionNotes: ['Retained as the shared IME composition contract for editor and TOC behavior.'],
    files: ['src/extension/extension/ImeComposition.ts', 'src/extension/extension/ime-shared.ts', 'src/extension/builders.tsx'],
    rationale: 'Protects composition/input behavior around editor IME flows and provides shared composition meta semantics for dependent features.',
    reviewOnUpgrade: ['Re-test Chinese/Japanese/Korean input after each Tiptap upgrade.', 'Verify Safari deleteCompositionText handling.', 'Verify dependent features such as TOC still honor composition meta.'],
  },
  {
    id: 'ListExtension',
    layer: 'core',
    maintenanceType: 'official-wrapper',
    upgradeDecision: 'partially-aligned',
    nextUpgradeAction: 'review-only',
    reviewedForVersion: '3.20.2',
    decisionNotes: ['Kept as a thin wrapper.', 'Local task-item DOM semantics were corrected and nested list drag-handle behavior was reviewed.'],
    files: ['src/extension/node/ListKit.tsx', 'src/extension/node/list-shared.ts', 'src/extension/builders.tsx'],
    rationale: 'Thin wrapper around upstream ListKit with local DOM semantics for ordered, bullet, task list, and task item nodes.',
    reviewOnUpgrade: ['Compare task list/task item DOM attributes and nested list behavior against upstream list/task-item fixes.'],
  },
  {
    id: 'CodeBlockLowlightExtension',
    layer: 'core',
    maintenanceType: 'business-extension',
    upgradeDecision: 'partially-aligned',
    nextUpgradeAction: 'review-only',
    reviewedForVersion: '3.20.2',
    decisionNotes: ['Aligned with safer named-import runtime behavior.', 'Local title metadata and mermaid-to-flow conversion remain intentionally retained.'],
    files: ['src/extension/node/CodeBlockLowlight.tsx', 'src/extension/component/CodeBlock/index.tsx'],
    rationale: 'Custom code block behavior adds title metadata, custom node views, and markdown-to-flow conversion on top of upstream lowlight.',
    reviewOnUpgrade: ['Compare lowlight runtime fixes with upstream, but preserve title UI and mermaid/flow conversion behavior.'],
  },
  {
    id: 'TableExtension',
    layer: 'core',
    maintenanceType: 'compat-patch',
    upgradeDecision: 'partially-aligned',
    nextUpgradeAction: 'review-only',
    reviewedForVersion: '3.20.2',
    decisionNotes: ['Still required locally.', 'Read-only drag protections and editable-only table UI mounting were tightened during the upgrade.'],
    files: ['src/extension/node/Table.tsx', 'src/extension/node/TableHandler/*'],
    rationale: 'Deep table override with local drag/resize/handle behavior.',
    reviewOnUpgrade: ['Audit drag handle, selection, resize, and nested table behavior against upstream.'],
  },
  {
    id: 'InlineLinkExtension',
    layer: 'core',
    maintenanceType: 'business-extension',
    upgradeDecision: 'partially-aligned',
    nextUpgradeAction: 'keep-business',
    reviewedForVersion: '3.20.2',
    decisionNotes: ['Retains local text/icon/block display modes.', 'Markdown output and title semantics were clarified to avoid conflating local display text with upstream HTML title behavior.'],
    files: ['src/extension/node/Link/index.tsx', 'src/extension/component/Link/*'],
    rationale: 'Started from upstream link logic but now carries product-specific text/icon/block display modes and custom node view behavior.',
    reviewOnUpgrade: ['Compare title, click, paste, and markdown behavior with upstream link releases without removing local multi-shape rendering.', 'Keep in mind that local title currently maps to display text, not upstream HTML title semantics.'],
  },
  {
    id: 'BlockLinkExtension',
    layer: 'core',
    maintenanceType: 'business-extension',
    files: ['src/extension/node/Link/index.tsx', 'src/extension/component/Link/*'],
    rationale: 'Block-style link is a product-specific node shape.',
    reviewOnUpgrade: ['Keep, but verify it still composes with upstream link parser changes.'],
  },
  {
    id: 'ImageExtension',
    layer: 'core',
    maintenanceType: 'business-extension',
    upgradeDecision: 'partially-aligned',
    nextUpgradeAction: 'review-only',
    reviewedForVersion: '3.20.2',
    decisionNotes: ['Explicit drag-handle semantics were restored so upstream atom/leaf drag fixes can apply.'],
    files: ['src/extension/node/Image.tsx', 'src/extension/component/Image/*'],
    rationale: 'Image node includes product-specific upload, crop, toolbar, and width behavior.',
    reviewOnUpgrade: ['Compare drag handle, node view, and markdown/media parsing with upstream image fixes.'],
  },
  {
    id: 'VideoExtension',
    layer: 'core',
    maintenanceType: 'business-extension',
    upgradeDecision: 'partially-aligned',
    reviewedForVersion: '3.20.2',
    decisionNotes: ['Aligned with shared media drag-handle and resize behavior after the upgrade.'],
    files: ['src/extension/node/Video.tsx', 'src/extension/component/Video/*'],
    rationale: 'Video node is a custom business extension with upload and resize UI.',
    reviewOnUpgrade: ['Check media node view behavior after upstream drag-handle and selection updates.'],
  },
  {
    id: 'AudioExtension',
    layer: 'core',
    maintenanceType: 'business-extension',
    upgradeDecision: 'needs-follow-up',
    nextUpgradeAction: 'review-only',
    reviewedForVersion: '3.20.2',
    decisionNotes: ['Still fully custom.', 'Should be compared with the upstream native audio extension in a later pass.'],
    files: ['src/extension/node/Audio.tsx', 'src/extension/component/Audio/*'],
    rationale: 'Custom audio business node.',
    reviewOnUpgrade: ['Compare against upstream native audio extension to decide whether any logic can be retired.'],
  },
  {
    id: 'IframeExtension',
    layer: 'core',
    maintenanceType: 'business-extension',
    upgradeDecision: 'partially-aligned',
    nextUpgradeAction: 'review-only',
    reviewedForVersion: '3.20.2',
    decisionNotes: ['Aligned with shared media drag-handle and resize behavior after the upgrade.'],
    files: ['src/extension/node/Iframe.tsx', 'src/extension/component/Iframe/*'],
    rationale: 'Custom iframe node with resize and validation behavior.',
    reviewOnUpgrade: ['Check node selection, resize, and URL validation after upgrades.'],
  },
  {
    id: 'InlineAttachmentExtension',
    layer: 'core',
    maintenanceType: 'business-extension',
    files: ['src/extension/node/Attachment.tsx', 'src/extension/component/Attachment/*'],
    rationale: 'Attachment rendering and metadata are product-specific.',
    reviewOnUpgrade: ['Keep schema-driven insertion path aligned with media/file handler changes.'],
  },
  {
    id: 'BlockAttachmentExtension',
    layer: 'core',
    maintenanceType: 'business-extension',
    files: ['src/extension/node/Attachment.tsx', 'src/extension/component/Attachment/*'],
    rationale: 'Block attachment is a product-specific node type.',
    reviewOnUpgrade: ['Keep schema and upload flow aligned with markdown/html parser behavior.'],
  },
  {
    id: 'CustomBlockMathExtension',
    layer: 'core',
    maintenanceType: 'compat-patch',
    upgradeDecision: 'needs-follow-up',
    nextUpgradeAction: 'try-remove',
    reviewedForVersion: '3.20.2',
    decisionNotes: ['Still retained after the 3.20.2 upgrade; no safe removal was identified yet.'],
    files: ['src/extension/node/Mathematics.tsx', 'src/extension/component/Mathematics/*'],
    rationale: 'Math rendering and migration logic compensate for historical content formats.',
    reviewOnUpgrade: ['Compare markdown parsing and migration needs against upstream mathematics releases.'],
  },
  {
    id: 'CustomInlineMathExtension',
    layer: 'core',
    maintenanceType: 'compat-patch',
    upgradeDecision: 'needs-follow-up',
    nextUpgradeAction: 'try-remove',
    reviewedForVersion: '3.20.2',
    decisionNotes: ['Still retained after the 3.20.2 upgrade; no safe removal was identified yet.'],
    files: ['src/extension/node/Mathematics.tsx', 'src/extension/component/Mathematics/*'],
    rationale: 'Inline math shares the same historical compatibility concerns as block math.',
    reviewOnUpgrade: ['Re-test markdown, selection, and node view behavior.'],
  },
  {
    id: 'VerticalAlign',
    layer: 'core',
    maintenanceType: 'business-extension',
    files: ['src/extension/node/VerticalAlign.tsx', 'src/extension/builders.tsx'],
    rationale: 'Vertical alignment is a local editor capability on top of textStyle.',
    reviewOnUpgrade: ['Check command names and mark application with upstream textStyle changes.'],
  },
  {
    id: 'Indent',
    layer: 'optional-core',
    maintenanceType: 'business-extension',
    files: ['src/extension/node/Indent.tsx', 'src/extension/builders.tsx'],
    rationale: 'Indent behavior spans many custom nodes and is product-specific.',
    reviewOnUpgrade: ['Check node coverage after adding or removing schemas.'],
  },
  {
    id: 'TableOfContents',
    layer: 'core',
    maintenanceType: 'product-support',
    upgradeDecision: 'carry-forward',
    nextUpgradeAction: 'review-only',
    reviewedForVersion: '3.20.2',
    decisionNotes: ['Still depends on the shared IME composition contract and remains a product-support concern.'],
    files: ['src/extension/node/TableOfContents/*'],
    rationale: 'TOC is a product-side support feature, not a core editing schema.',
    reviewOnUpgrade: ['Check heading scanning, IME timing, and scroll sync.', 'Verify TOC still respects shared IME composition meta contracts.'],
  },
  {
    id: 'FileHandlerExtension',
    layer: 'editable',
    maintenanceType: 'product-support',
    upgradeDecision: 'partially-aligned',
    nextUpgradeAction: 'review-only',
    reviewedForVersion: '3.20.2',
    decisionNotes: ['Schema-based file insertion is retained and aligned with the upgraded markdown/html flow.'],
    files: ['src/extension/node/FileHandler.tsx', 'src/util/fileHandler.ts'],
    rationale: 'File ingestion pipeline connects uploads to schema insertion.',
    reviewOnUpgrade: ['Re-check paste/drop transformation APIs and schema insertion flow.'],
  },
  {
    id: 'UploadProgressExtension',
    layer: 'editable',
    maintenanceType: 'product-support',
    files: ['src/extension/node/UploadProgress.tsx', 'src/extension/component/UploadProgress/*'],
    rationale: 'UI-only support node for upload lifecycle.',
    reviewOnUpgrade: ['Keep aligned with file handler and media upload lifecycle.'],
  },
  {
    id: 'InlineUploadProgressExtension',
    layer: 'core',
    maintenanceType: 'product-support',
    files: ['src/extension/node/InlineUploadProgress.tsx'],
    rationale: 'Inline upload feedback support node.',
    reviewOnUpgrade: ['Keep schema and rendering aligned with upload flow.'],
  },
  {
    id: 'SlashCommands',
    layer: 'editable',
    maintenanceType: 'product-support',
    files: ['src/extension/extension/SlashCommands.ts', 'src/extension/suggestion/slash.ts'],
    rationale: 'Command menu is an editor product entrypoint built on suggestion.',
    reviewOnUpgrade: ['Compare suggestion open/close behavior and renderer lifecycle with upstream changes.'],
  },
  {
    id: 'MentionExtension',
    layer: 'feature',
    maintenanceType: 'official-wrapper',
    files: ['src/extension/node/Mention.tsx', 'src/extension/suggestion/mention.ts'],
    rationale: 'Mention is mostly upstream capability with local data and position handling.',
    reviewOnUpgrade: ['Check suggestion renderer lifecycle and remote filter behavior.'],
  },
  {
    id: 'AiWritingExtension',
    layer: 'editable',
    maintenanceType: 'product-support',
    files: ['src/extension/extension/AiWriting.ts', 'src/hook/index.ts'],
    rationale: 'AI writing is a product-side capability, not an upstream editing primitive.',
    reviewOnUpgrade: ['Check keyboard interception and storage access.'],
  },
  {
    id: 'StructuredDiffExtension',
    layer: 'readonly',
    maintenanceType: 'product-support',
    files: ['src/extension/extension/StructuredDiff.ts', 'src/EditorDiff/index.tsx'],
    rationale: 'Readonly diff view is product assembly behavior.',
    reviewOnUpgrade: ['Keep readonly editor and diff commands aligned with upstream transaction behavior.'],
  },
  {
    id: 'YoutubeExtension',
    layer: 'feature',
    maintenanceType: 'official-wrapper',
    upstreamPackage: '@tiptap/extension-youtube',
    files: ['src/extension/node/Youtube.tsx', 'src/extension/builders.tsx'],
    rationale: 'Thin wrapper around upstream YouTube extension.',
    reviewOnUpgrade: ['Check embed URL normalization and command options.'],
  },
  {
    id: 'ExcalidrawExtension',
    layer: 'editable',
    maintenanceType: 'business-extension',
    files: ['src/extension/node/DrawPanel.tsx', 'src/extension/component/DrawPanel/*'],
    rationale: 'Diagram insertion workflow is product-specific.',
    reviewOnUpgrade: ['Check upload integration and node replacement flow.'],
  },
];

export const getExtensionCatalogByMaintenanceType = (
  maintenanceType: ExtensionMaintenanceType,
) => TIPTAP_EXTENSION_CATALOG.filter((item) => item.maintenanceType === maintenanceType);

export const getExtensionCatalogByLayer = (
  layer: ExtensionLayer,
) => TIPTAP_EXTENSION_CATALOG.filter((item) => item.layer === layer);

export const getExtensionCatalogByUpgradeDecision = (
  decision: ExtensionUpgradeDecision,
) => TIPTAP_EXTENSION_CATALOG.filter((item) => item.upgradeDecision === decision);

export const getExtensionCatalogByNextUpgradeAction = (
  nextUpgradeAction: NextUpgradeAction,
) => TIPTAP_EXTENSION_CATALOG.filter((item) => item.nextUpgradeAction === nextUpgradeAction);
