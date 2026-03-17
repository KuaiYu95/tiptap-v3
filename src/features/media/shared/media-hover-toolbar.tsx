import { ActionDropdown } from '../../../components';
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  DeleteLineIcon,
  DownloadLineIcon,
  EditLineIcon,
} from '../../../components/Icons';
import { ToolbarItem } from '../../../components/Toolbar';
import { Divider, Stack } from '@mui/material';
import React from 'react';

export const MediaHoverToolbar = ({
  editButtonRef,
  editTip,
  onEdit,
  downloadTip,
  onDownload,
  align,
  onAlignChange,
  widthDropdownId,
  selectedWidth,
  useFixedWidthDisplay,
  onWidthPercentChange,
  deleteTip,
  onDelete,
  extraActions,
  showWidthDropdown = true,
}: {
  editButtonRef: React.Ref<HTMLButtonElement>;
  editTip: string;
  onEdit: () => void;
  downloadTip?: string;
  onDownload?: () => void;
  align: 'left' | 'center' | 'right' | null | undefined;
  onAlignChange: (align: 'left' | 'center' | 'right') => void;
  widthDropdownId: string;
  selectedWidth: string;
  useFixedWidthDisplay: boolean;
  onWidthPercentChange: (width: '50%' | '75%' | '100%') => void;
  deleteTip: string;
  onDelete: () => void;
  extraActions?: React.ReactNode;
  showWidthDropdown?: boolean;
}) => {
  return (
    <Stack direction="row" alignItems="center" sx={{ p: 0.5 }}>
      <ToolbarItem
        ref={editButtonRef}
        icon={<EditLineIcon sx={{ fontSize: '1rem' }} />}
        tip={editTip}
        onClick={onEdit}
      />
      {onDownload ? (
        <ToolbarItem
          icon={<DownloadLineIcon sx={{ fontSize: '1rem' }} />}
          tip={downloadTip}
          onClick={onDownload}
        />
      ) : null}
      {extraActions}
      <Divider
        orientation="vertical"
        flexItem
        sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }}
      />
      <ToolbarItem
        icon={<AlignLeftIcon sx={{ fontSize: '1rem' }} />}
        tip="左侧对齐"
        className={align === 'left' ? 'tool-active' : ''}
        onClick={() => onAlignChange('left')}
      />
      <ToolbarItem
        icon={<AlignCenterIcon sx={{ fontSize: '1rem' }} />}
        tip="居中对齐"
        className={align === 'center' ? 'tool-active' : ''}
        onClick={() => onAlignChange('center')}
      />
      <ToolbarItem
        icon={<AlignRightIcon sx={{ fontSize: '1rem' }} />}
        tip="右侧对齐"
        className={align === 'right' ? 'tool-active' : ''}
        onClick={() => onAlignChange('right')}
      />
      <Divider
        orientation="vertical"
        flexItem
        sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }}
      />
      {showWidthDropdown ? (
        <>
          <ActionDropdown
            id={widthDropdownId}
            selected={selectedWidth}
            defaultDisplay={useFixedWidthDisplay ? { label: '固定宽度' } : undefined}
            list={[
              {
                key: '50',
                label: '自适应宽度（50%）',
                onClick: () => onWidthPercentChange('50%'),
              },
              {
                key: '75',
                label: '自适应宽度（75%）',
                onClick: () => onWidthPercentChange('75%'),
              },
              {
                key: '100',
                label: '自适应宽度（100%）',
                onClick: () => onWidthPercentChange('100%'),
              },
            ]}
          />
          <Divider
            orientation="vertical"
            flexItem
            sx={{ height: '1rem', mx: 0.5, alignSelf: 'center', borderColor: 'divider' }}
          />
        </>
      ) : null}
      <ToolbarItem
        icon={<DeleteLineIcon sx={{ fontSize: '1rem' }} />}
        tip={deleteTip}
        onClick={onDelete}
      />
    </Stack>
  );
};
