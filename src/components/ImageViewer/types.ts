import { ReactNode } from 'react';

export interface ImageViewerProviderProps {
  children: ReactNode;
  speed?: number | ((type: number) => number);
  maskOpacity?: number | null;
  onVisibleChange?: (visible: boolean, index: number) => void;
  onIndexChange?: (index: number) => void;
  loop?: boolean | number;
  photoClosable?: boolean;
  maskClosable?: boolean;
  pullClosable?: boolean;
  className?: string;
  maskClassName?: string;
  photoWrapClassName?: string;
  photoClassName?: string;
  loadingElement?: JSX.Element;
  brokenElement?: JSX.Element | ((photoProps: { src: string }) => JSX.Element);
  portalContainer?: HTMLElement;
}

export interface ImageViewerItemProps {
  src: string;
  children?: ReactNode;
  triggers?: Array<'onClick' | 'onDoubleClick'>;
}

export interface ImageViewerContextType {
  currentSrc: string;
  visible: boolean;
  currentIndex: number;
  totalImages: number;
  getScale: () => number;
  getRotate: () => number;
  getOnScale: () => ((scale: number) => void) | null;
  getOnRotate: () => ((rotate: number) => void) | null;
  getOnClose: () => (() => void) | null;
  onImageClick: (src: string) => void;
  onPrevImage: () => void;
  onNextImage: () => void;
}

