import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const FormulaIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M10 2C7.79086 2 6 3.79086 6 6V9H3V11H6V18C6 19.1046 5.10457 20 4 20H3V22H4C6.20914 22 8 20.2091 8 18V11H11V9H8V6C8 4.89543 8.89543 4 10 4H11V2H10ZM15.2022 16.9971L11.8907 21H14.4864L16.5 18.5659L18.5137 21H21.1093L17.7979 16.9971L21.1046 13H18.5089L16.5 15.4283L14.4912 13H11.8955L15.2022 16.9971Z"></path>
    </SvgIcon>
  );
};
FormulaIcon.displayName = 'icon-formula';
