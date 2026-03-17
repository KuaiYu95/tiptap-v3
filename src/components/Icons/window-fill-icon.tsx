import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const WindowFillIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM20 10H4V19H20V10ZM5 6V8H7V6H5ZM9 6V8H11V6H9Z"></path>
    </SvgIcon>
  );
};

WindowFillIcon.displayName = 'icon-window-fill';
