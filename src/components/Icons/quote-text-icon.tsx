import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const QuoteTextIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M21 4H3V6H21V4ZM21 11H8V13H21V11ZM21 18H8V20H21V18ZM5 11H3V20H5V11Z"></path>
    </SvgIcon>
  );
};
QuoteTextIcon.displayName = 'icon-quote-text';
