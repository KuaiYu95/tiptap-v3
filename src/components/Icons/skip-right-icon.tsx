import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const SkipRightIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M10.0858 12L5.29289 16.7929L6.70711 18.2071L12.9142 12L6.70711 5.79291L5.29289 7.20712L10.0858 12ZM17 6.00002L17 18H15L15 6.00002L17 6.00002Z"></path>
    </SvgIcon>
  );
};

SkipRightIcon.displayName = 'icon-skip-right';

