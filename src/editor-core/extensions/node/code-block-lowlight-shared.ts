export const createCodeBlockTitleAttribute = () => ({
  title: {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute('data-title'),
    renderHTML: (attributes: { title?: string }) => {
      if (!attributes.title) {
        return {};
      }

      return {
        'data-title': attributes.title,
      };
    },
  },
});

export const parseCodeBlockMarkdownToken = (token: any, helpers: any) => {
  const isFenced = token.codeBlockStyle === 'fenced' ||
    (token.raw && /^\s*(?:```|~~~)/.test(token.raw));
  const isIndented = token.codeBlockStyle === 'indented';

  if (!isFenced && !isIndented) {
    return [];
  }

  if (token.lang === 'mermaid') {
    return helpers.createNode(
      'flow',
      { code: token.text || '', width: '100%' },
      [],
    );
  }

  return helpers.createNode(
    'codeBlock',
    { language: token.lang || null },
    token.text ? [helpers.createTextNode(token.text)] : [],
  );
};
