import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const ArrowDownSLineIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z"></path>
    </SvgIcon>
  );
};

ArrowDownSLineIcon.displayName = 'icon-arrow-down-s-line';