import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const IndentIncreaseIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M3 4H21V6H3V4ZM3 19H21V21H3V19ZM11 14H21V16H11V14ZM11 9H21V11H11V9ZM7 12.5L3 16V9L7 12.5Z"></path>
    </SvgIcon>
  );
};

IndentIncreaseIcon.displayName = 'icon-indent-increase';
