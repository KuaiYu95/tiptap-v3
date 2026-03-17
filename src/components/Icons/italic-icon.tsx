import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const ItalicIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M15 20H7V18H9.92661L12.0425 6H9V4H17V6H14.0734L11.9575 18H15V20Z"></path>
    </SvgIcon>
  );
};
ItalicIcon.displayName = 'icon-italic';
