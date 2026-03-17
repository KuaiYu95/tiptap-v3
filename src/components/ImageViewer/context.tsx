import React from 'react';
import { ImageViewerContextType } from './types';

export const ImageViewerContext = React.createContext<ImageViewerContextType>({
  currentSrc: '',
  visible: false,
  currentIndex: 0,
  totalImages: 0,
  getScale: () => 1,
  getRotate: () => 0,
  getOnScale: () => null,
  getOnRotate: () => null,
  getOnClose: () => null,
  onImageClick: () => { },
  onPrevImage: () => { },
  onNextImage: () => { },
});

