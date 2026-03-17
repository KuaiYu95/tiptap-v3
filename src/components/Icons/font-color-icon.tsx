import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const FontColorIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M15.2459 14H8.75407L7.15407 18H5L11 3H13L19 18H16.8459L15.2459 14ZM14.4459 12L12 5.88516L9.55407 12H14.4459Z"></path>
    </SvgIcon>
  );
};
FontColorIcon.displayName = 'icon-font-color';
