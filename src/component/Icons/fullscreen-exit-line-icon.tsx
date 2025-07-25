import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const FullscreenExitLineIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M18 7H22V9H16V3H18V7ZM8 9H2V7H6V3H8V9ZM18 17V21H16V15H22V17H18ZM8 15V21H6V17H2V15H8Z"></path>
    </SvgIcon>
  );
};
FullscreenExitLineIcon.displayName = 'icon-fullscreen-exit-line';
