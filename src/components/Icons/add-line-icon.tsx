import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const AddLineIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path>
    </SvgIcon>
  );
};

AddLineIcon.displayName = 'icon-add-line';
