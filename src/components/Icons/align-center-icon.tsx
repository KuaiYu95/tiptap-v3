import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const AlignCenterIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M3 4H21V6H3V4ZM5 19H19V21H5V19ZM3 14H21V16H3V14ZM5 9H19V11H5V9Z"></path>
    </SvgIcon>
  );
};
AlignCenterIcon.displayName = 'icon-align-center';
