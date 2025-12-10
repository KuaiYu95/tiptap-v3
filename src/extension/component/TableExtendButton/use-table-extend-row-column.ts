import {
  offset,
  size,
  useFloating,
  useTransitionStyles,
  type Placement,
} from '@floating-ui/react';
import { useEffect, useMemo } from 'react';
import type { Orientation } from '../../../util/table-utils';

interface TableExtendRowColumnButtonPositionResult {
  isMounted: boolean;
  ref: (node: HTMLElement | null) => void;
  style: React.CSSProperties;
}

interface TableExtendRowColumnButtonsPositioningResult {
  rowButton: TableExtendRowColumnButtonPositionResult;
  columnButton: TableExtendRowColumnButtonPositionResult;
}

const ORIENTATION_CONFIG = {
  row: {
    placement: 'bottom' as Placement,
    sizeProperty: 'width',
  },
  column: {
    placement: 'right' as Placement,
    sizeProperty: 'height',
  },
} as const;

/** 使用 Floating UI 定位扩展按钮的自定义 Hook */
function useTableExtendRowColumnButtonPosition(
  orientation: Orientation,
  show: boolean,
  referencePosTable: DOMRect | null
): TableExtendRowColumnButtonPositionResult {
  const config = ORIENTATION_CONFIG[orientation];

  const { refs, update, context, floatingStyles } = useFloating({
    open: show,
    placement: config.placement,
    middleware: [
      offset(4),
      size({
        apply({ rects, elements }) {
          const floating = elements.floating;
          if (!floating) return;

          // 按方向同步尺寸
          const sizeValue = `${rects.reference[config.sizeProperty]}px`;
          floating.style[config.sizeProperty] = sizeValue;
        },
      }),
    ],
  });

  const { isMounted, styles } = useTransitionStyles(context);

  useEffect(() => {
    if (!referencePosTable) {
      refs.setReference(null);
      return;
    }

    // 使用虚拟元素返回最新矩形，方便滚动时 autoUpdate 生效
    refs.setReference({
      getBoundingClientRect: () => {
        // 始终取闭包里的最新值
        return referencePosTable || new DOMRect();
      },
    });
    update();
  }, [referencePosTable, refs, update]);

  return useMemo(
    () => ({
      isMounted,
      ref: refs.setFloating,
      style: {
        display: 'flex',
        ...styles,
        ...floatingStyles,
      } as React.CSSProperties,
    }),
    [floatingStyles, isMounted, refs.setFloating, styles]
  );
}

/** 管理行列扩展按钮位置的 Hook */
export function useTableExtendRowColumnButtonsPositioning(
  showAddOrRemoveColumnsButton: boolean,
  showAddOrRemoveRowsButton: boolean,
  referencePosTable: DOMRect | null,
  referencePosLastRow: DOMRect | null,
  referencePosLastCol: DOMRect | null
): TableExtendRowColumnButtonsPositioningResult {
  const rowButton = useTableExtendRowColumnButtonPosition(
    'row',
    showAddOrRemoveRowsButton,
    referencePosLastRow || referencePosTable
  );

  const columnButton = useTableExtendRowColumnButtonPosition(
    'column',
    showAddOrRemoveColumnsButton,
    referencePosLastCol || referencePosTable
  );

  return useMemo(
    () => ({
      rowButton,
      columnButton,
    }),
    [rowButton, columnButton]
  );
}
