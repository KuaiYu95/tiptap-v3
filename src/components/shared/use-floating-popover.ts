import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  Placement,
  shift,
  Strategy,
  VirtualElement,
} from '@floating-ui/dom';
import React from 'react';

export const useFloatingPopover = ({
  open,
  anchorEl,
  onClose,
  placement,
  strategy,
  offsetValue,
}: {
  open: boolean;
  anchorEl: HTMLElement | VirtualElement | null;
  onClose: () => void;
  placement: Placement;
  strategy: Strategy;
  offsetValue: number;
}) => {
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (!open || !anchorEl || !popoverRef.current) {
      return;
    }

    const updatePosition = () => {
      if (!popoverRef.current) {
        return;
      }

      computePosition(anchorEl, popoverRef.current, {
        placement,
        strategy,
        middleware: [
          offset(offsetValue),
          flip(),
          shift({ padding: 8 }),
        ],
      }).then(({ x, y }) => {
        setPosition({ x, y });
      });
    };

    updatePosition();
    return autoUpdate(anchorEl, popoverRef.current, updatePosition);
  }, [anchorEl, offsetValue, open, placement, strategy]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (!popoverRef.current || popoverRef.current.contains(event.target as Node)) {
        return;
      }

      const isHitAnchor =
        anchorEl instanceof HTMLElement && anchorEl.contains(event.target as Node);

      if (!isHitAnchor) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [anchorEl, onClose, open]);

  return {
    popoverRef,
    position,
  };
};
