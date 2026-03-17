import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const AlignVerticallyIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M3 11H21V13H3V11ZM18 18V21H16V18H13L17 14L21 18H18ZM8 18V21H6V18H3L7 14L11 18H8ZM18 6H21L17 10L13 6H16V3H18V6ZM8 6H11L7 10L3 6H6V3H8V6Z"></path>
    </SvgIcon>
  );
};

AlignVerticallyIcon.displayName = 'icon-align-vertically';
