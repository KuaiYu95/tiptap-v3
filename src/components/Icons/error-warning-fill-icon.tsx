import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const ErrorWarningFillIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
    </SvgIcon>
  );
};

ErrorWarningFillIcon.displayName = 'icon-error-warning-fill';
