import React, { useContext } from 'react';
import { ImageViewerContext } from './context';
import { ImageViewerItemProps } from './types';

export const ImageViewerItem: React.FC<ImageViewerItemProps & { onImageClick?: (src: string) => void }> = ({
  src,
  children,
  triggers = ['onClick'],
  onImageClick,
}) => {
  const context = useContext(ImageViewerContext);

  const handleClick = (e: React.MouseEvent) => {
    // 如果在拖拽，不处理
    if (e.defaultPrevented) {
      return;
    }

    if (triggers.includes('onClick')) {
      const clickHandler = onImageClick || context.onImageClick;
      if (clickHandler) {
        e.stopPropagation();
        clickHandler(src);
      }
    }
  };

  // 直接克隆 children 并添加点击事件
  if (React.isValidElement(children)) {
    const originalProps = children.props as any;
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        // 先调用原来的 onClick
        if (originalProps.onClick) {
          originalProps.onClick(e);
        }
        // 再调用我们的处理
        if (!e.defaultPrevented) {
          handleClick(e);
        }
      },
      'data-image-viewer-item': true,
      'data-src': src,
    });
  }

  return <>{children}</>;
};

