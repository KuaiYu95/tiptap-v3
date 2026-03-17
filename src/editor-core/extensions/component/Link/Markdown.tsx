import { ChromeIcon, Download2LineIcon } from "../../../../components/Icons";
import { Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MarkViewProps } from "@tiptap/core";
import { MarkViewContent } from "@tiptap/react";
import React, { useCallback } from "react";

const LinkViewWrapper: React.FC<MarkViewProps> = ({ editor, mark }) => {
  const theme = useTheme();
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (mark?.attrs?.download) {
      e.preventDefault();
      const href = mark.attrs.href;
      if (href) {
        const link = document.createElement('a');
        link.href = href;
        link.download = mark.attrs.download === '' ? href.split('/').pop() || 'download' : mark.attrs.download;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }, [mark]);

  const href = mark?.attrs?.href || '';
  const target = mark?.attrs?.target || '_blank';
  const download = mark?.attrs?.download;

  let favicon = ''
  try {
    favicon = mark?.attrs?.href ? new URL(mark.attrs.href).origin + '/favicon.ico' : ''
  } catch (err) {
  }

  return (
    <MarkViewContent
      as="a"
      href={href}
      target={download ? undefined : target}
      download={download || undefined}
      onClick={handleClick}
      style={{
        color: theme.palette.primary.main,
        cursor: 'pointer',
      }}
    >
      <Avatar
        component='span'
        sx={{
          width: '16px',
          height: '16px',
          bgcolor: '#FFFFFF',
          display: 'inline-flex',
          verticalAlign: '-0.125em',
          marginRight: '2px',
        }}
        src={download ? undefined : favicon}
      >
        {download ? <Download2LineIcon
          sx={{ fontSize: '1rem', color: 'primary.main' }}
        /> : <ChromeIcon sx={{
          fontSize: '1rem',
        }} />}
      </Avatar>
    </MarkViewContent>
  );
}

export default LinkViewWrapper
