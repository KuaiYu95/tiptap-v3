import { MenuItem } from '../../types';
import { Box, Popover, PopoverOrigin, Stack } from '@mui/material';
import React from 'react';
import MenuItemContent from '../shared/menu-item-content';
import MenuSurface from '../shared/menu-surface';

export interface NestedMenuListProps {
  list: MenuItem[];
  width?: React.CSSProperties['width'];
  arrowIcon?: React.ReactNode;
  childrenProps?: {
    anchorOrigin?: PopoverOrigin;
    transformOrigin?: PopoverOrigin;
  };
  onItemClick?: (item: MenuItem) => void;
  zIndex?: number;
}

const NestedList: React.FC<NestedMenuListProps> = ({
  list,
  width,
  arrowIcon,
  childrenProps = {
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'right',
    },
    transformOrigin: {
      vertical: 4,
      horizontal: 'left',
    }
  },
  onItemClick,
  zIndex,
}) => {
  const [hoveredItem, setHoveredItem] = React.useState<MenuItem | null>(null);
  const [subMenuAnchor, setSubMenuAnchor] = React.useState<HTMLElement | null>(null);

  const handleItemHover = (event: React.MouseEvent<HTMLElement>, item: MenuItem) => {
    if (item.children?.length) {
      setHoveredItem(item);
      setSubMenuAnchor(event.currentTarget);
    }
  };

  const handleItemLeave = () => {
    setHoveredItem(null);
    setSubMenuAnchor(null);
  };

  const handleItemClickInternal = (item: MenuItem) => {
    if (onItemClick) {
      onItemClick(item);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <MenuSurface className="menu-select-list" width={width}>
      {list.map(item => item.customLabel ? (
        <Box key={item.key}>
          {item.customLabel}
        </Box>
      ) : (
        <Box
          key={item.key}
          className="menu-select-item"
          onMouseEnter={(e) => handleItemHover(e, item)}
          onMouseLeave={handleItemLeave}
          onClick={() => handleItemClickInternal(item)}
          sx={{
            position: 'relative',
            cursor: 'pointer',
            borderRadius: 1,
            fontSize: 14,
            p: 1,
            ':hover': {
              bgcolor: 'action.hover',
            },
            ...(item.selected ? {
              color: 'primary.main',
              bgcolor: 'action.selected',
            } : {}),
          }}
        >
          <MenuItemContent item={item} arrowIcon={arrowIcon} />
          {hoveredItem === item && item.children && (
            <Popover
              open={Boolean(subMenuAnchor)}
              anchorEl={subMenuAnchor}
              onClose={handleItemLeave}
              sx={{
                pointerEvents: 'none',
                ...(zIndex ? { zIndex } : {})
              }}
              disableScrollLock
              disableAutoFocus
              disableEnforceFocus
              disableRestoreFocus
              {...childrenProps}
            >
              <MenuSurface
                className="menu-select-sub-list"
                width={item.width}
                minWidth={item.minWidth}
                maxHeight={item.maxHeight || 360}
                sx={{ pointerEvents: 'auto' }}
              >
                {item.children.map(child => child.customLabel ? (
                  <Box key={child.key}>
                    {child.customLabel}
                  </Box>
                ) : (
                  <Box
                    key={child.key}
                    className="menu-select-sub-item"
                    onClick={() => handleItemClickInternal(child)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 1,
                      fontSize: 14,
                      p: 1,
                      ':hover': {
                        bgcolor: 'action.hover',
                      },
                      ...(child.selected ? {
                        color: 'primary.main',
                        bgcolor: 'action.selected',
                      } : {}),
                    }}
                  >
                    <MenuItemContent item={child} />
                  </Box>
                ))}
              </MenuSurface>
            </Popover>
          )}
        </Box>
      ))}
    </MenuSurface>
  );
};

export default NestedList;

