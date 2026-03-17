import { MenuItem } from '../../types';
import {
  Box,
  Popover,
  PopoverOrigin,
  Stack,
} from '@mui/material';
import React from 'react';
import { ArrowDownSLineIcon } from '../Icons';
import { ToolbarItem } from '../Toolbar';
import MenuItemContent from '../shared/menu-item-content';
import MenuSurface from '../shared/menu-surface';
import { usePopoverAnchor } from '../shared/use-popover-anchor';

export interface ActionDropdownProps {
  /** 菜单列表 */
  list: MenuItem[];
  /** 当前选中项的 key */
  selected: string | number;
  /** 触发器提示 */
  tip?: string;
  /** Popover ID */
  id?: string;
  /** 菜单宽度 */
  width?: number;
  /** 菜单最小宽度 */
  minWidth?: number;
  /** 右侧箭头图标 */
  arrowIcon?: React.ReactNode;
  /** Popover 锚点位置 */
  anchorOrigin?: PopoverOrigin;
  /** Popover 变换位置 */
  transformOrigin?: PopoverOrigin;
  /** 当没有选中值时的默认显示内容 */
  defaultDisplay?: {
    icon?: React.ReactNode;
    label?: string;
  };
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  list,
  selected,
  tip,
  id = 'action-dropdown',
  width,
  minWidth = 160,
  arrowIcon,
  anchorOrigin = {
    vertical: 'bottom',
    horizontal: 'left',
  },
  transformOrigin = {
    vertical: 'top',
    horizontal: 'left',
  },
  defaultDisplay,
}) => {
  const {
    anchorEl,
    open: openPopover,
    close: closePopover,
    isOpen,
  } = usePopoverAnchor<HTMLButtonElement>();

  // 根据 selected 找到当前选中的项
  const selectedItem = React.useMemo(() => {
    return list.find(item => item.key === selected);
  }, [list, selected]);

  // 获取显示的图标和标签
  const displayIcon = selectedItem?.icon || defaultDisplay?.icon;
  const displayLabel = selectedItem?.label || defaultDisplay?.label || '';

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    openPopover(event);
  };

  const handleClose = () => {
    closePopover();
  };

  const handleItemClick = (event: React.MouseEvent<HTMLDivElement>, item: MenuItem) => {
    event.preventDefault();
    event.stopPropagation();

    // 立即执行回调
    if (item.onClick) {
      item.onClick();
    }

    // 然后关闭菜单
    handleClose();
  };

  const curId = isOpen ? id : undefined;

  return (
    <>
      <ToolbarItem
        icon={displayIcon}
        text={
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Box component="span">{displayLabel}</Box>
            <ArrowDownSLineIcon
              sx={{
                fontSize: 16,
                transition: 'transform 0.2s ease-in-out',
                transform: isOpen ? 'rotate(-180deg)' : 'rotate(0deg)',
              }}
            />
          </Stack>
        }
        tip={tip}
        onClick={handleClick}
        aria-describedby={curId}
      />
      <Popover
        id={curId}
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        disableScrollLock
        disableAutoFocus
        disableEnforceFocus
        slotProps={{
          root: {
            slotProps: {
              backdrop: {
                invisible: true,
              },
            },
          },
        }}
      >
        <MenuSurface minWidth={minWidth} width={width}>
          {list.map((item) =>
            item.customLabel ? (
              <Box key={item.key}>{item.customLabel}</Box>
            ) : (
              <Box
                key={item.key}
                onMouseDown={(event: React.MouseEvent<HTMLDivElement>) => handleItemClick(event, item)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  fontSize: 14,
                  p: 1,
                  userSelect: 'none',
                  ':hover': {
                    bgcolor: 'action.hover',
                  },
                  ...(item.key === selected
                    ? {
                      color: 'primary.main',
                      bgcolor: 'action.selected',
                    }
                    : {}),
                }}
              >
                <MenuItemContent item={item} arrowIcon={arrowIcon} />
              </Box>
            )
          )}
        </MenuSurface>
      </Popover>
    </>
  );
};

export default ActionDropdown;
