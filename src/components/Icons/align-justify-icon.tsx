import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const AlignJustifyIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M3 4H21V6H3V4ZM3 19H21V21H3V19ZM3 14H21V16H3V14ZM3 9H21V11H3V9Z"></path>
    </SvgIcon>
  );
};
AlignJustifyIcon.displayName = 'icon-align-justify';
