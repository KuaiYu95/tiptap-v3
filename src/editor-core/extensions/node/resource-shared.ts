export const escapeHtmlAttribute = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

export const escapeMarkdownLinkText = (value: string) => value
  .replace(/\\/g, '\\\\')
  .replace(/\[/g, '\\[')
  .replace(/\]/g, '\\]');

export const escapeMarkdownLinkHref = (value: string) => value
  .replace(/\\/g, '\\\\')
  .replace(/\)/g, '\\)');

export const renderMarkdownLink = (attrs: { href?: string; title?: string }) => {
  const href = attrs.href || '';
  const text = attrs.title || attrs.href || '';

  return `[${escapeMarkdownLinkText(text)}](${escapeMarkdownLinkHref(href)})`;
};

export const renderDownloadAnchorMarkdown = ({
  href,
  title,
  download,
  extraAttributes = {},
}: {
  href: string;
  title: string;
  download?: string;
  extraAttributes?: Record<string, string | number | boolean | null | undefined>;
}) => {
  if (!href) {
    return '';
  }

  const attributes = [
    `href="${escapeHtmlAttribute(href)}"`,
    ...Object.entries(extraAttributes)
      .filter(([, value]) => value !== null && value !== undefined && value !== false)
      .map(([key, value]) => value === true
        ? key
        : `${key}="${escapeHtmlAttribute(String(value))}"`),
    'target="_blank"',
    `download="${escapeHtmlAttribute(download || title)}"`,
  ];

  return `<a ${attributes.join(' ')}>${escapeHtmlAttribute(title)}</a>`;
};
