import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const AlignRightIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M3 4H21V6H3V4ZM7 19H21V21H7V19ZM3 14H21V16H3V14ZM7 9H21V11H7V9Z"></path>
    </SvgIcon>
  );
};
AlignRightIcon.displayName = 'icon-align-right';
