import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const SkipUpIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 13.9142L16.7929 18.7071L18.2071 17.2929L12 11.0858L5.79289 17.2929L7.20711 18.7071L12 13.9142ZM6 7L18 7V9L6 9L6 7Z"></path>
    </SvgIcon>
  );
};

SkipUpIcon.displayName = 'icon-skip-up';

