import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const PauseLineIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M6 5H8V19H6V5ZM16 5H18V19H16V5Z"></path>
    </SvgIcon>
  );
};

PauseLineIcon.displayName = 'icon-pause-line';
