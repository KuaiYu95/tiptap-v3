import type { Editor } from '@tiptap/react';
import React from 'react';

const getNumericWidth = (width?: number | string | null) => {
  return typeof width === 'number' ? width : undefined;
};

export const useMediaWidth = ({
  editor,
  contentRef,
  nodeClassName,
  width,
  elementRef,
}: {
  editor: Editor;
  contentRef: React.RefObject<HTMLElement | null>;
  nodeClassName: string;
  width?: number | string | null;
  elementRef: React.RefObject<HTMLElement | null>;
}) => {
  const isPercentWidth = React.useCallback(() => {
    if (!width) return true;
    return typeof width === 'string' && width.endsWith('%');
  }, [width]);

  const getCurrentWidthPercent = React.useCallback(() => {
    if (isPercentWidth()) {
      if (!width) return '100';
      if (typeof width === 'string' && width.endsWith('%')) {
        return width.replace('%', '');
      }
      return '100';
    }

    return 'pixel';
  }, [isPercentWidth, width]);

  const getEditorWidth = React.useCallback(() => {
    if (contentRef.current) {
      let current: HTMLElement | null = contentRef.current;
      while (current) {
        if (current.classList?.contains(nodeClassName)) {
          const style = window.getComputedStyle(current);
          const paddingLeft = parseFloat(style.paddingLeft) || 0;
          const paddingRight = parseFloat(style.paddingRight) || 0;
          return current.clientWidth - paddingLeft - paddingRight;
        }
        current = current.parentElement;
      }
    }

    if (editor?.view?.dom) {
      const editorElement = editor.view.dom as HTMLElement;
      const style = window.getComputedStyle(editorElement);
      const paddingLeft = parseFloat(style.paddingLeft) || 0;
      const paddingRight = parseFloat(style.paddingRight) || 0;
      const editorWidth = editorElement.clientWidth - paddingLeft - paddingRight;
      if (editorWidth > 0) {
        return editorWidth;
      }
    }

    return 800;
  }, [contentRef, editor, nodeClassName]);

  const getCurrentDisplayWidth = React.useCallback(() => {
    if (!elementRef.current) {
      return getEditorWidth();
    }

    const computedStyle = window.getComputedStyle(elementRef.current);
    const displayWidth = elementRef.current.offsetWidth;

    if (typeof width === 'string' && width.endsWith('%')) {
      return displayWidth;
    }

    const numericWidth = getNumericWidth(width);
    if (numericWidth !== undefined) {
      if (computedStyle.maxWidth === '100%' && displayWidth < numericWidth) {
        return displayWidth;
      }
      return numericWidth;
    }

    return getEditorWidth();
  }, [elementRef, getEditorWidth, width]);

  return {
    isPercentWidth,
    getCurrentWidthPercent,
    getEditorWidth,
    getCurrentDisplayWidth,
  };
};
