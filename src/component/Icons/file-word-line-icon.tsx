import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const FileWordLineIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M16 8V16H14L12 14L10 16H8V8H10V13L12 11L14 13V8H15V4H5V20H19V8H16ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"></path>
    </SvgIcon>
  );
};
FileWordLineIcon.displayName = 'icon-file-word-line';
