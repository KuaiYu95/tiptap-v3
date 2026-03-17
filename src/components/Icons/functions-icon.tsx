import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const FunctionsIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M5 18L12.6796 12L5 6V4H19V6H8.26348L16 12L8.26348 18H19V20H5V18Z"></path>
    </SvgIcon>
  );
};
FunctionsIcon.displayName = 'icon-functions';
