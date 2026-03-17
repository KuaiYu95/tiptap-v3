export const customStyles = `
  .PhotoView-Slider__toolbar {
    display: none !important;
  }
  
  .PhotoView-Slider__banner {
    display: none !important;
  }
  
  .PhotoView-Slider__toolbar-custom {
    position: fixed !important;
    bottom: 0 !important;
    top: auto !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 10000 !important;
    transform: none !important;
  }

  /* 毛玻璃效果 */
  .PhotoView-Slider__Backdrop {
    backdrop-filter: blur(10px) saturate(180%);
  }

  /* 覆盖默认动画效果 */
  .PhotoView-Slider__Backdrop,
  .PhotoView-Slider__Backdrop * {
    transition-timing-function: initial !important;
    transition-duration: initial !important;
    animation-duration: initial !important;
  }
`;

