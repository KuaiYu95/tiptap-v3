import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const AlignTopIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M3 3H21V5H3V3ZM8 11V21H6V11H3L7 7L11 11H8ZM18 11V21H16V11H13L17 7L21 11H18Z"></path>
    </SvgIcon>
  );
};

AlignTopIcon.displayName = 'icon-align-top';
