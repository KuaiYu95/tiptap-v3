import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PhotoSlider } from 'react-photo-view';
import { ImageViewerContext } from './context';
import { customStyles } from './styles';
import { CustomToolbar } from './Toolbar';
import { ImageViewerProviderProps } from './types';

export const ImageViewerProvider: React.FC<ImageViewerProviderProps> = ({
  children,
  speed = 500,
  maskOpacity = 0.3,
  onVisibleChange,
  onIndexChange,
  loop = 3,
  photoClosable,
  maskClosable = true,
  pullClosable = true,
  className,
  maskClassName,
  photoWrapClassName,
  photoClassName,
  loadingElement,
  brokenElement,
  portalContainer,
}) => {
  const [currentSrc, setCurrentSrc] = useState('');
  const [visible, setVisible] = useState(false);
  const [viewIndex, setViewIndex] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayStateRef = useRef<{
    scale: number;
    rotate: number;
    onScale: ((scale: number) => void) | null;
    onRotate: ((rotate: number) => void) | null;
    onClose: (() => void) | null;
  }>({
    scale: 1,
    rotate: 0,
    onScale: null,
    onRotate: null,
    onClose: null,
  });

  // 注入自定义样式
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('image-viewer-custom-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'image-viewer-custom-styles';
      styleElement.textContent = customStyles;
      document.head.appendChild(styleElement);
    }
  }, []);

  // 从 DOM 中动态收集所有图片数据（按照 DOM 顺序）
  const collectImagesFromDOM = useCallback((): { src: string; key: string }[] => {
    if (!containerRef.current) return [];

    const items = containerRef.current.querySelectorAll('[data-image-viewer-item]');
    const result: { src: string; key: string }[] = [];

    items.forEach((item) => {
      const src = item.getAttribute('data-src');
      if (src) {
        result.push({ src, key: src });
      }
    });

    return result;
  }, []);

  // 处理图片点击
  const handleImageClick = useCallback((src: string) => {
    // 每次点击时动态从 DOM 收集图片列表
    const images = collectImagesFromDOM();
    const index = images.findIndex((img) => img.src === src);

    if (index !== -1) {
      setViewIndex(index);
      setCurrentSrc(src);
      setTotalImages(images.length);
      setVisible(true);
      onVisibleChange?.(true, index);
    }
  }, [collectImagesFromDOM, onVisibleChange]);

  // 上一张
  const handlePrevImage = useCallback(() => {
    const images = collectImagesFromDOM();
    if (images.length === 0) return;

    const newIndex = viewIndex > 0 ? viewIndex - 1 : images.length - 1;
    setViewIndex(newIndex);
    setCurrentSrc(images[newIndex].src);
    onIndexChange?.(newIndex);
  }, [viewIndex, collectImagesFromDOM, onIndexChange]);

  // 下一张
  const handleNextImage = useCallback(() => {
    const images = collectImagesFromDOM();
    if (images.length === 0) return;

    const newIndex = viewIndex < images.length - 1 ? viewIndex + 1 : 0;
    setViewIndex(newIndex);
    setCurrentSrc(images[newIndex].src);
    onIndexChange?.(newIndex);
  }, [viewIndex, collectImagesFromDOM, onIndexChange]);

  const contextValue = React.useMemo(
    () => ({
      currentSrc,
      visible,
      currentIndex: viewIndex,
      totalImages,
      getScale: () => overlayStateRef.current.scale,
      getRotate: () => overlayStateRef.current.rotate,
      getOnScale: () => overlayStateRef.current.onScale,
      getOnRotate: () => overlayStateRef.current.onRotate,
      getOnClose: () => overlayStateRef.current.onClose,
      onImageClick: handleImageClick,
      onPrevImage: handlePrevImage,
      onNextImage: handleNextImage,
    }),
    [currentSrc, visible, viewIndex, totalImages, handleImageClick, handlePrevImage, handleNextImage]
  );

  const handleSpeed = typeof speed === 'function' ? speed : () => speed;

  // 当需要显示时，动态获取图片列表
  const displayImages = React.useMemo(() => {
    if (visible) {
      return collectImagesFromDOM();
    }
    return [];
  }, [visible, collectImagesFromDOM]);

  return (
    <ImageViewerContext.Provider value={contextValue}>
      <div ref={containerRef}>{children}</div>
      <PhotoSlider
        images={displayImages}
        visible={visible}
        index={viewIndex}
        onClose={() => {
          setVisible(false);
          onVisibleChange?.(false, viewIndex);
        }}
        onIndexChange={(index) => {
          setViewIndex(index);
          const src = displayImages[index]?.src;
          if (src) setCurrentSrc(src);
          onIndexChange?.(index);
        }}
        bannerVisible={false}
        speed={handleSpeed}
        maskOpacity={maskOpacity}
        loop={loop}
        photoClosable={photoClosable}
        maskClosable={maskClosable}
        pullClosable={pullClosable}
        className={className}
        maskClassName={maskClassName}
        photoWrapClassName={photoWrapClassName}
        photoClassName={photoClassName}
        loadingElement={loadingElement}
        brokenElement={brokenElement}
        portalContainer={portalContainer}
        overlayRender={({ onScale, scale, rotate, onRotate, onClose }) => {
          overlayStateRef.current = { scale, rotate, onScale, onRotate, onClose };
          return null;
        }}
      />
      <CustomToolbar />
    </ImageViewerContext.Provider>
  );
};

