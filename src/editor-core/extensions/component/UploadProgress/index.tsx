import { Box } from '@mui/material';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { UploadFileType } from '../../../../utils/file';
import { getUploadProgressContainerSx, UploadProgressContent } from './shared';

export interface UploadProgressAttributes {
  fileName: string;
  fileType: UploadFileType;
  progress: number;
  tempId: string;
}

const UploadProgressView: React.FC<NodeViewProps> = ({ node }) => {
  const attrs = node.attrs as UploadProgressAttributes;

  return (
    <NodeViewWrapper className="upload-progress-wrapper">
      <Box
        sx={getUploadProgressContainerSx(attrs.progress)}
        data-temp-id={attrs.tempId}
      >
        <UploadProgressContent
          fileName={attrs.fileName}
          fileType={attrs.fileType}
          progress={attrs.progress}
        />
      </Box>
    </NodeViewWrapper>
  );
};

export default UploadProgressView;  
