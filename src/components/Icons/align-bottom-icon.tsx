import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const AlignBottomIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M3 19H21V21H3V19ZM8 13H11L7 17L3 13H6V3H8V13ZM18 13H21L17 17L13 13H16V3H18V13Z"></path>
    </SvgIcon>
  );
};

AlignBottomIcon.displayName = 'icon-align-bottom';
