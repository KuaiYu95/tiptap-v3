import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const InsertColumnLeftIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M20 3C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H14C13.4477 21 13 20.5523 13 20V4C13 3.44772 13.4477 3 14 3H20ZM19 5H15V19H19V5ZM6 7C8.76142 7 11 9.23858 11 12C11 14.7614 8.76142 17 6 17C3.23858 17 1 14.7614 1 12C1 9.23858 3.23858 7 6 7ZM7 9H5V10.999L3 11V13L5 12.999V15H7V12.999L9 13V11L7 10.999V9Z"></path>
    </SvgIcon>
  );
};
InsertColumnLeftIcon.displayName = 'icon-insert-column-left';
