import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const HeadingIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M17 11V4H19V21H17V13H7V21H5V4H7V11H17Z"></path>
    </SvgIcon>
  );
};
HeadingIcon.displayName = 'icon-heading';
