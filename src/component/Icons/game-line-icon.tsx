import { SvgIcon, SvgIconProps } from "@mui/material";
import * as React from "react";

export const GameLineIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      version='1.1'
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 2C15.1215 2 17.9089 3.43021 19.7428 5.67108L13.4142 12L19.7428 18.3289C17.9089 20.5698 15.1215 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C13.7232 20 15.3548 19.4531 16.6974 18.4774L16.905 18.32L10.5859 12L16.905 5.679L16.6974 5.52261C15.4338 4.60431 13.9142 4.06583 12.3031 4.00565L12 4ZM12 5C12.8284 5 13.5 5.67157 13.5 6.5C13.5 7.32843 12.8284 8 12 8C11.1716 8 10.5 7.32843 10.5 6.5C10.5 5.67157 11.1716 5 12 5Z"></path>
    </SvgIcon>
  );
};
GameLineIcon.displayName = 'icon-game-line';
