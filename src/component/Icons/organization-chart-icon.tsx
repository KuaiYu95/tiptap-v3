import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const OrganizationChartIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M15 3C15.5523 3 16 3.44772 16 4V8C16 8.55228 15.5523 9 15 9H13V11H17C17.5523 11 18 11.4477 18 12V15H20C20.5523 15 21 15.4477 21 16V20C21 20.5523 20.5523 21 20 21H14C13.4477 21 13 20.5523 13 20V16C13 15.4477 13.4477 15 14 15H16V13H8V15H10C10.5523 15 11 15.4477 11 16V20C11 20.5523 10.5523 21 10 21H4C3.44772 21 3 20.5523 3 20V16C3 15.4477 3.44772 15 4 15H6V12C6 11.4477 6.44772 11 7 11H11V9H9C8.44772 9 8 8.55228 8 8V4C8 3.44772 8.44772 3 9 3H15ZM9 17H5V19H9V17ZM19 17H15V19H19V17ZM14 5H10V7H14V5Z"></path>
    </SvgIcon>
  );
};
OrganizationChartIcon.displayName = 'icon-organization-chart';
