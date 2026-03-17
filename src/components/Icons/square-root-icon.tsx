import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const SquareRootIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M15.382 4H22V6H16.618L9 21.2361L5.38197 14H2V12H6.61803L9 16.7639L15.382 4Z"></path>
    </SvgIcon>
  );
};
SquareRootIcon.displayName = 'icon-square-root';
