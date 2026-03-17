import { MenuItem, MenuProps } from '../../types';
import {
  Box,
  Popover
} from '@mui/material';
import React from 'react';
import MenuSurface from '../shared/menu-surface';
import { usePopoverAnchor } from '../shared/use-popover-anchor';
import NestedList from './NestedList';

export interface MenuRef {
  close: () => void;
}

const Menu = React.forwardRef<MenuRef, MenuProps>(({
  id = 'menu-select',
  width,
  maxHeight,
  arrowIcon,
  list,
  header = null,
  context,
  anchorOrigin = {
    vertical: 'bottom',
    horizontal: 'right',
  },
  transformOrigin = {
    vertical: 'top',
    horizontal: 'right',
  },
  childrenProps = {
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'right',
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'left',
    }
  },
  zIndex,
  onOpen,
  onClose,
}, ref) => {
  const {
    anchorEl,
    open: openPopover,
    close: closePopover,
    isOpen,
  } = usePopoverAnchor<HTMLButtonElement>();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (context?.props?.onClick) {
      context.props.onClick(event);
    }
    openPopover(event);
    onOpen?.();
  };

  const handleClose = () => {
    closePopover();
    onClose?.();
  };

  React.useImperativeHandle(ref, () => ({
    close: handleClose
  }));

  const handleItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    }
    handleClose();
  };

  const curId = isOpen ? id : undefined;
  return <>
    {context && React.cloneElement(context, { onClick: handleClick, 'aria-describedby': curId })}
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
      disableRestoreFocus
      sx={zIndex ? { zIndex } : undefined}
    >
      <MenuSurface maxHeight={maxHeight}>
        <Box onClick={handleClose}>
          {header}
        </Box>
        <NestedList
          width={width}
          list={list}
          arrowIcon={arrowIcon}
          childrenProps={childrenProps}
          onItemClick={handleItemClick}
          zIndex={zIndex}
        />
      </MenuSurface>
    </Popover>
  </>
});

Menu.displayName = 'Menu';

export default Menu;
