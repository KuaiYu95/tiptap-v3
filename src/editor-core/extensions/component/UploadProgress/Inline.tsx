import { Stack } from '@mui/material';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { UploadFileType } from '../../../../utils/file';
import { getUploadProgressContainerSx, UploadProgressContent } from './shared';

export interface InlineUploadProgressAttributes {
  fileName: string;
  fileType: UploadFileType;
  progress: number;
  tempId: string;
}

const InlineUploadProgressView: React.FC<NodeViewProps> = ({ node }) => {
  const attrs = node.attrs as InlineUploadProgressAttributes;

  return (
    <NodeViewWrapper className="inline-upload-progress-wrapper" style={{ display: 'inline-flex' }}>
      <Stack
        component="span"
        direction="row"
        alignItems="center"
        gap={1}
        sx={getUploadProgressContainerSx(attrs.progress, { maxWidth: '100%' })}
        data-temp-id={attrs.tempId}
      >
        <UploadProgressContent
          fileName={attrs.fileName}
          fileType={attrs.fileType}
          progress={attrs.progress}
        />
      </Stack>
    </NodeViewWrapper>
  );
};

export default InlineUploadProgressView;
