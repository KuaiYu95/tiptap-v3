import {
  offset,
  size,
  useFloating,
  useTransitionStyles,
} from '@floating-ui/react';
import { useEffect, useMemo } from 'react';
import { clamp } from '../../../util/table-utils';

type Orientation = 'row' | 'col' | 'cell';

type DraggingState = {
  draggedCellOrientation: Exclude<Orientation, 'cell'>;
  mousePos: number;
  initialOffset?: number;
  originalCellSize?: { width: number; height: number };
};

/** 创建行手柄的参考 DOMRect，贴边并与单元格对齐 */
function makeRowRect(
  cell: DOMRect,
  table: DOMRect,
  dragging?: DraggingState
): DOMRect {
  const baseY = dragging?.draggedCellOrientation === 'row'
    ? clamp(dragging.mousePos + (dragging.initialOffset ?? 0), table.y, table.bottom - cell.height)
    : cell.y;

  // 行手柄沿整行宽度，高度保持单元格高度
  return new DOMRect(table.x, baseY, table.width, cell.height);
}

/** 创建列手柄的参考 DOMRect，贴边并与单元格对齐 */
function makeColRect(
  cell: DOMRect,
  table: DOMRect,
  dragging?: DraggingState
): DOMRect {
  const baseX = dragging?.draggedCellOrientation === 'col'
    ? clamp(dragging.mousePos + (dragging.initialOffset ?? 0), table.x, table.right - cell.width)
    : cell.x;

  // 列手柄宽度保持单元格宽度，高度沿整列
  return new DOMRect(baseX, table.y, cell.width, table.height);
}

/** 创建单元格手柄的参考 DOMRect */
function makeCellRect(cell: DOMRect): DOMRect {
  return new DOMRect(cell.x, cell.y, cell.width, 0);
}

/** 根据手柄方向获取浮层位置 */
function getPlacement(orientation: Orientation) {
  switch (orientation) {
    case 'row':
      return 'left' as const;
    case 'col':
      return 'top' as const;
    case 'cell':
    default:
      return 'bottom-end' as const;
  }
}

/** 根据手柄方向获取偏移配置 */
function getOffset(orientation: Orientation) {
  switch (orientation) {
    case 'row':
      return 4;
    case 'col':
      return 4;
    case 'cell':
    default:
      return { mainAxis: 1, crossAxis: -1 } as const;
  }
}

/** 按方向生成对应的参考 DOMRect */
function rectFactory(
  orientation: Orientation,
  cell: DOMRect,
  table: DOMRect,
  dragging?: DraggingState
): DOMRect {
  switch (orientation) {
    case 'row':
      return makeRowRect(cell, table, dragging);
    case 'col':
      return makeColRect(cell, table, dragging);
    case 'cell':
    default:
      return makeCellRect(cell);
  }
}

/** 基于 Floating UI 定位单个表格手柄的 Hook */
export function useTableHandlePosition(
  orientation: Orientation,
  show: boolean,
  referencePosCell: DOMRect | null,
  referencePosTable: DOMRect | null,
  draggingState?: DraggingState
): {
  isMounted: boolean;
  ref: (node: HTMLElement | null) => void;
  style: React.CSSProperties;
} {
  const placement = useMemo(() => getPlacement(orientation), [orientation]);
  const offsetValue = useMemo(() => getOffset(orientation), [orientation]);

  const { refs, update, context, floatingStyles } = useFloating({
    open: show,
    placement,
    middleware: [
      offset(offsetValue),
      size({
        apply({ rects, elements }) {
          if (!elements.floating) return;

          const refWidth =
            (orientation === 'col'
              ? (referencePosTable?.width ?? referencePosCell?.width)
              : (referencePosTable?.width ?? referencePosCell?.width)) ??
            rects.reference.width;

          const refHeight =
            (orientation === 'row'
              ? (referencePosTable?.height ?? referencePosCell?.height)
              : (referencePosTable?.height ?? referencePosCell?.height)) ??
            rects.reference.height;

          // 将尺寸写入 CSS 变量，便于样式使用
          elements.floating.style.setProperty(
            '--table-handle-ref-width',
            `${refWidth}px`
          );
          elements.floating.style.setProperty(
            '--table-handle-ref-height',
            `${refHeight}px`
          );

          // 主尺寸随方向切换，行取高度、列取宽度
          const mainSize = orientation === 'row' ? refHeight : refWidth;
          elements.floating.style.setProperty(
            '--table-handle-available-size',
            `${mainSize}px`
          );
        },
      }),
    ],
  });

  const { isMounted, styles } = useTransitionStyles(context);

  // 为 Floating UI 提供虚拟参考矩形；使用闭包拿最新值以保证 autoUpdate 生效
  useEffect(() => {
    // 尚无参考节点
    if (!referencePosCell || !referencePosTable) {
      refs.setReference(null);
      return;
    }

    // 拖动时隐藏单元格手柄（保持与原行为一致）
    if (draggingState && orientation === 'cell') {
      refs.setReference(null);
      return;
    }

    // 创建返回最新矩形的虚拟元素，保证滚动时位置能自动更新
    refs.setReference({
      getBoundingClientRect: () => {
        if (!referencePosCell || !referencePosTable) {
          return new DOMRect();
        }
        return rectFactory(orientation, referencePosCell, referencePosTable, draggingState);
      },
    });
  }, [refs, orientation, referencePosCell, referencePosTable, draggingState]);

  // 参考位置变化时更新浮层
  useEffect(() => {
    if (!show || !referencePosCell || !referencePosTable) return;
    update();
  }, [
    update,
    show,
    orientation,
    referencePosCell,
    referencePosTable,
    draggingState,
  ]);

  return useMemo(
    () => ({
      isMounted,
      ref: refs.setFloating,
      style: {
        display: 'flex',
        ...styles,
        ...floatingStyles,
      },
    }),
    [isMounted, refs.setFloating, styles, floatingStyles]
  );
}

/** 统一返回行、列、单元格手柄的位置数据 */
export function useTableHandlePositioning(
  show: boolean,
  referencePosCell: DOMRect | null,
  referencePosTable: DOMRect | null,
  draggingState?: DraggingState
) {
  const rowHandle = useTableHandlePosition(
    'row',
    show,
    referencePosCell,
    referencePosTable,
    draggingState
  );

  const colHandle = useTableHandlePosition(
    'col',
    show,
    referencePosCell,
    referencePosTable,
    draggingState
  );

  const cellHandle = useTableHandlePosition(
    'cell',
    show,
    referencePosCell,
    referencePosTable,
    draggingState
  );

  return useMemo(
    () => ({ rowHandle, colHandle, cellHandle }),
    [rowHandle, colHandle, cellHandle]
  );
}
