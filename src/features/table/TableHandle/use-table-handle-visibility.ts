import { useCallback, useMemo, useState } from 'react';

type TableHandleMenuType = 'row' | 'column';

export function useTableHandleVisibility({
  hasValidRowIndex,
  hasValidColIndex,
  rowMounted,
  colMounted,
}: {
  hasValidRowIndex: boolean;
  hasValidColIndex: boolean;
  rowMounted: boolean;
  colMounted: boolean;
}) {
  const [isRowVisible, setIsRowVisible] = useState(true);
  const [isColumnVisible, setIsColumnVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState<TableHandleMenuType | null>(null);

  const toggleRowVisibility = useCallback((visible: boolean) => {
    setIsRowVisible(visible);
  }, []);

  const toggleColumnVisibility = useCallback((visible: boolean) => {
    setIsColumnVisible(visible);
  }, []);

  const handleMenuOpenChange = useCallback((type: TableHandleMenuType, open: boolean) => {
    setMenuOpen(open ? type : null);
  }, []);

  const shouldShowRow = useMemo(
    () => ((isRowVisible && rowMounted && hasValidRowIndex) || menuOpen === 'row'),
    [hasValidRowIndex, isRowVisible, menuOpen, rowMounted],
  );

  const shouldShowColumn = useMemo(
    () => ((isColumnVisible && colMounted && hasValidColIndex) || menuOpen === 'column'),
    [colMounted, hasValidColIndex, isColumnVisible, menuOpen],
  );

  return {
    shouldShowRow,
    shouldShowColumn,
    toggleRowVisibility,
    toggleColumnVisibility,
    handleMenuOpenChange,
  };
}
