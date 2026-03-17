import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const SkipDownIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 10.0858L7.20711 5.29291L5.79289 6.70712L12 12.9142L18.2071 6.70712L16.7929 5.29291L12 10.0858ZM18 17L6 17L6 15L18 15V17Z"></path>
    </SvgIcon>
  );
};

SkipDownIcon.displayName = 'icon-skip-down';

