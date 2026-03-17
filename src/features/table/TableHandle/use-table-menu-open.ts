import type { Editor } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';

interface UseTableMenuOpenOptions {
  editor?: Editor | null;
  onOpenChange?: (isOpen: boolean) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function useTableMenuOpen({
  editor,
  onOpenChange,
  onOpen,
  onClose,
}: UseTableMenuOpenOptions) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = useCallback(
    (isOpen: boolean) => {
      setIsMenuOpen(isOpen);

      if (editor) {
        if (isOpen) {
          editor.commands.freezeHandles();
        } else {
          editor.commands.unfreezeHandles();
        }
      }

      if (isOpen) {
        onOpen?.();
      } else {
        onClose?.();
      }
    },
    [editor, onClose, onOpen]
  );

  useEffect(() => {
    onOpenChange?.(isMenuOpen);
  }, [isMenuOpen, onOpenChange]);

  return {
    isMenuOpen,
    handleMenuToggle,
  };
}
