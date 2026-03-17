import React from 'react';

export type DisplayMode = 'edit' | 'preview' | 'split';

export const useDisplayMode = (defaultDisplayMode: DisplayMode) => {
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>(defaultDisplayMode);
  const [isExpend, setIsExpend] = React.useState(false);

  const toggleExpand = React.useCallback(() => {
    setIsExpend((previous) => !previous);
  }, []);

  return {
    displayMode,
    setDisplayMode,
    isExpend,
    toggleExpand,
  };
};
