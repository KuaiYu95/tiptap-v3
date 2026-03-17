import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const FontFamilyIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M5.55397 22H3.3999L10.9999 3H12.9999L20.5999 22H18.4458L16.0458 16H7.95397L5.55397 22ZM8.75397 14H15.2458L11.9999 5.88517L8.75397 14Z"></path>
    </SvgIcon>
  );
};
FontFamilyIcon.displayName = 'icon-font-family';
