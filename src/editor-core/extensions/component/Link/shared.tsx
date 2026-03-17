import { CarouselViewIcon, ScrollToBottomLineIcon, TextIcon } from "../../../../components/Icons";
import { Editor } from "@tiptap/core";
import React from "react";
import { getLinkTitle } from "../../../../utils";

export type LinkDisplayType = 'text' | 'icon' | 'block';

export interface LinkAttributes {
  href: string
  target: string
  class: string
  title: string
  rel: string
  type: LinkDisplayType
}

export const LINK_DISPLAY_OPTIONS: Array<{
  key: LinkDisplayType;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    key: 'text',
    label: '文字',
    icon: <TextIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'icon',
    label: '图标文字',
    icon: <ScrollToBottomLineIcon sx={{ transform: 'rotate(90deg)', fontSize: '1rem' }} />,
  },
  {
    key: 'block',
    label: '卡片',
    icon: <CarouselViewIcon sx={{ transform: 'rotate(90deg)', fontSize: '1rem' }} />,
  },
];

export const buildLinkNodeAttrs = (
  attrs: LinkAttributes,
  overrides: Partial<LinkAttributes> = {},
): LinkAttributes => ({
  title: attrs.title,
  href: attrs.href,
  type: attrs.type,
  target: attrs.target,
  class: attrs.class,
  rel: attrs.rel,
  ...overrides,
});

export const replaceLinkNodeAtPos = ({
  editor,
  pos,
  nodeSize,
  nodeType,
  attrs,
}: {
  editor: Editor;
  pos: number;
  nodeSize: number;
  nodeType: 'inlineLink' | 'blockLink';
  attrs: LinkAttributes;
}) => editor.chain()
  .focus()
  .deleteRange({ from: pos, to: pos + nodeSize })
  .insertContentAt(pos, {
    type: nodeType,
    attrs,
  })
  .run();

export const getResolvedLinkTitle = (attrs: Pick<LinkAttributes, 'href' | 'title'>) => (
  attrs.title || getLinkTitle(attrs.href)
);

export const getLinkFavicon = (href?: string) => {
  if (!href) {
    return '';
  }

  try {
    return new URL(href).origin + '/favicon.ico';
  } catch {
    return '';
  }
};
