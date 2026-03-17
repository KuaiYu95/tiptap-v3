import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const SeparatorIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M2 11H4V13H2V11ZM6 11H18V13H6V11ZM20 11H22V13H20V11Z"></path>
    </SvgIcon>
  );
};
SeparatorIcon.displayName = 'icon-separator';
