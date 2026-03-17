import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const SkipLeftIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M13.9142 12L18.7071 7.20712L17.2929 5.79291L11.0858 12L17.2929 18.2071L18.7071 16.7929L13.9142 12ZM7 18V6.00001H9V18H7Z"></path>
    </SvgIcon>
  );
};

SkipLeftIcon.displayName = 'icon-skip-left';

