import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const ArrowLeftWideLineIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M8.3685 12L13.1162 3.03212L14.8838 3.9679L10.6315 12L14.8838 20.0321L13.1162 20.9679L8.3685 12Z"></path>
    </SvgIcon>
  );
};
ArrowLeftWideLineIcon.displayName = 'icon-arrow-left-wide-line';
