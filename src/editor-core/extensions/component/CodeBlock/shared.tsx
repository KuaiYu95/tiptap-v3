import React from 'react';
import { languages } from '../../../../constants/highlight';

export interface CodeBlockAttributes {
  language?: string;
  title?: string;
}

export const DEFAULT_CODE_BLOCK_TITLE = '代码块';

export const filterCodeLanguages = (searchText: string) => {
  if (!searchText) {
    return languages;
  }

  const lowerSearch = searchText.toLowerCase();

  return languages.filter(
    (lang) =>
      lang.label.toLowerCase().includes(lowerSearch) ||
      lang.value.toLowerCase().includes(lowerSearch),
  );
};

export const isCustomCodeLanguage = (language?: string) => (
  !!language && !languages.find((item) => item.value === language)
);

export const useCodeBlockCopy = (codeText: string) => {
  const [copyText, setCopyText] = React.useState('复制');

  const handleCopy = React.useCallback(
    async (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();

      try {
        await navigator.clipboard.writeText(codeText);
        setCopyText('复制成功');

        const timer = window.setTimeout(() => {
          setCopyText('复制');
        }, 2000);

        return () => window.clearTimeout(timer);
      } catch (error) {
        console.error('复制失败:', error);
      }
    },
    [codeText],
  );

  return {
    copyText,
    handleCopy,
  };
};
