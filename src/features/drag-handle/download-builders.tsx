import React from 'react';
import {
  AttachmentLineIcon,
  DownloadLineIcon,
  ImageLineIcon,
  MovieLineIcon,
  Music2LineIcon,
} from '../../components/Icons';
import { NodeTypeEnum } from '../../constants/enums';
import { MenuItem } from '../../types';
import { downloadFiles, FileInfo } from '../../utils';
import ActionCountBadge from './action-count-badge';
import { CurrentNodeInfo, CurrentState, ResourceState } from './types';

const downloadSingleNodeResource = async (current: CurrentState) => {
  if (!current.node || current.pos === undefined) {
    return;
  }

  if ([NodeTypeEnum.Video, NodeTypeEnum.Audio, NodeTypeEnum.BlockAttachment].includes(current.node.type.name as NodeTypeEnum)) {
    const srcUrl = current.node.attrs.src || current.node.attrs.url;
    const nodeFile = await fetch(srcUrl);
    const nodeBlob = await nodeFile.blob();
    const nodeUrl = URL.createObjectURL(nodeBlob);
    const nodeName = current.node.attrs.title || `${current.node.type.name}.${srcUrl.split('.').pop()}`;
    const anchor = document.createElement('a');
    anchor.href = nodeUrl;
    anchor.download = nodeName;
    anchor.click();
    URL.revokeObjectURL(nodeUrl);
  }
};

export const buildDownloadActions = ({
  current,
  currentNode,
  resources,
}: {
  current: CurrentState;
  currentNode: CurrentNodeInfo;
  resources: ResourceState;
}): MenuItem[] => {
  if (currentNode?.download && (current.node?.attrs.src || current.node?.attrs.url)) {
    return [
      {
        label: `下载${currentNode?.label}`,
        key: 'download',
        icon: <DownloadLineIcon sx={{ fontSize: '1rem' }} />,
        onClick: async () => {
          await downloadSingleNodeResource(current);
        },
      },
    ];
  }

  return [
    ...(resources.images.length > 0 ? [{
      label: '下载图片',
      key: 'download-img',
      icon: <ImageLineIcon sx={{ fontSize: '1rem' }} />,
      extra: <ActionCountBadge count={resources.images.length} />,
      onClick: async () => {
        const imageInfos: FileInfo[] = resources.images.map((img) => ({
          src: img.attrs.src,
          filename: img.attrs.alt || img.attrs.title || undefined,
        }));
        await downloadFiles(imageInfos, 'img');
      },
    }] : []),
    ...(resources.videos.length > 0 ? [{
      label: '下载视频',
      key: 'download-video',
      icon: <MovieLineIcon sx={{ fontSize: '1rem' }} />,
      extra: <ActionCountBadge count={resources.videos.length} />,
      onClick: async () => {
        const videoInfos: FileInfo[] = resources.videos.map((video) => ({
          src: video.attrs.src,
          filename: video.attrs.alt || video.attrs.title || undefined,
        }));
        await downloadFiles(videoInfos, 'video');
      },
    }] : []),
    ...(resources.audios.length > 0 ? [{
      label: '下载音频',
      key: 'download-audio',
      icon: <Music2LineIcon sx={{ fontSize: '1rem' }} />,
      extra: <ActionCountBadge count={resources.audios.length} />,
      onClick: async () => {
        const audioInfos: FileInfo[] = resources.audios.map((audio) => ({
          src: audio.attrs.src,
          filename: audio.attrs.alt || audio.attrs.title || undefined,
        }));
        await downloadFiles(audioInfos, 'audio');
      },
    }] : []),
    ...(resources.attachments.length > 0 ? [{
      label: '下载附件',
      key: 'download-attachment',
      icon: <AttachmentLineIcon sx={{ fontSize: '1rem' }} />,
      extra: <ActionCountBadge count={resources.attachments.length} />,
      onClick: async () => {
        const attachmentInfos: FileInfo[] = resources.attachments.map((attachment) => ({
          src: attachment.attrs.url,
          filename: attachment.attrs.title || undefined,
        }));
        await downloadFiles(attachmentInfos, 'attachment');
      },
    }] : []),
  ];
};
