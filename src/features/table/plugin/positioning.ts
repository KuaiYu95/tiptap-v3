import type { Node as TiptapNode } from '@tiptap/pm/model';
import { isHTMLElement } from '../../../utils/table';
import type { TableHandlesState } from './shared';

const HANDLE_SELECTOR =
  '.tiptap-table-handle-menu, .tiptap-table-extend-row-column-button, .tiptap-table-add-button';

export const getCachedHandleRects = ({
  root,
  state,
}: {
  root: Document | ShadowRoot;
  state?: TableHandlesState;
}): DOMRect[] => {
  const now = Date.now();
  if (
    state?._cachedHandleRects &&
    state._cachedHandleRectsTime &&
    now - state._cachedHandleRectsTime < 100
  ) {
    return state._cachedHandleRects;
  }

  const rects = Array.from(root.querySelectorAll(HANDLE_SELECTOR))
    .filter(isHTMLElement)
    .map((element) => element.getBoundingClientRect());

  if (state) {
    state._cachedHandleRects = rects;
    state._cachedHandleRectsTime = now;
  }

  return rects;
};

export const isPointerNearHandle = (event: MouseEvent, rects: DOMRect[]) => {
  return rects.some((rect) => {
    const expandedRect = new DOMRect(
      rect.left - 10,
      rect.top - 10,
      rect.width + 20,
      rect.height + 20,
    );

    return (
      event.clientX >= expandedRect.left &&
      event.clientX <= expandedRect.right &&
      event.clientY >= expandedRect.top &&
      event.clientY <= expandedRect.bottom
    );
  });
};

export const getNearestRowReference = (
  tbody: HTMLElement,
  clientY: number,
): {
  rowIndex?: number;
  cellRect?: DOMRect;
} => {
  const rows = Array.from(tbody.children) as HTMLElement[];
  let rowIndex: number | undefined;
  let cellRect: DOMRect | undefined;
  let minDistance = Number.POSITIVE_INFINITY;

  rows.forEach((rowElement, index) => {
    const rowRect = rowElement.getBoundingClientRect();
    const distance = Math.abs(clientY - (rowRect.top + rowRect.height / 2));

    if (distance < minDistance) {
      minDistance = distance;
      rowIndex = index;
      const firstCell = rowElement.children[0] as HTMLElement | undefined;
      cellRect = firstCell?.getBoundingClientRect() ?? rowRect;
    }
  });

  return { rowIndex, cellRect };
};

export const getLastEdgeReferences = ({
  tableBody,
  tableNode,
  includeLastRow,
  includeLastColumn,
}: {
  tableBody: HTMLElement;
  tableNode: TiptapNode;
  includeLastRow: boolean;
  includeLastColumn: boolean;
}) => {
  let referencePosLastRow: DOMRect | undefined;
  let referencePosLastCol: DOMRect | undefined;

  const lastRowIndex = tableNode.content.childCount - 1;
  const lastColIndex = (tableNode.content.firstChild?.content.childCount ?? 0) - 1;

  if (includeLastRow) {
    const lastRow = tableBody.children[lastRowIndex] as HTMLElement | undefined;
    if (lastRow) {
      referencePosLastRow = lastRow.getBoundingClientRect();
    }
  }

  if (includeLastColumn) {
    let maxRight = 0;
    let lastColRect: DOMRect | null = null;

    for (let i = 0; i < tableBody.children.length; i += 1) {
      const row = tableBody.children[i] as HTMLElement | undefined;
      if (!row || !row.children[lastColIndex]) continue;
      const cellRect = (row.children[lastColIndex] as HTMLElement).getBoundingClientRect();
      if (cellRect.right > maxRight) {
        maxRight = cellRect.right;
        lastColRect = cellRect;
      }
    }

    if (lastColRect) {
      const firstRow = tableBody.children[0] as HTMLElement | undefined;
      const lastRow = tableBody.children[lastRowIndex] as HTMLElement | undefined;
      const firstCell = firstRow?.children[lastColIndex] as HTMLElement | undefined;
      if (firstCell && lastRow) {
        const firstRect = firstCell.getBoundingClientRect();
        referencePosLastCol = new DOMRect(
          lastColRect.right,
          firstRect.top,
          0,
          lastRow.getBoundingClientRect().bottom - firstRect.top,
        );
      }
    }
  }

  return {
    referencePosLastRow,
    referencePosLastCol,
  };
};

export const preserveCellRectSize = ({
  rect,
  originalSize,
}: {
  rect: DOMRect;
  originalSize?: { width: number; height: number };
}) => {
  if (!originalSize) {
    return rect;
  }

  return new DOMRect(rect.x, rect.y, originalSize.width, originalSize.height);
};

export const getReferenceCellRect = ({
  tableBody,
  rowIndex,
  colIndex,
  originalSize,
}: {
  tableBody: HTMLElement;
  rowIndex?: number;
  colIndex?: number;
  originalSize?: { width: number; height: number };
}) => {
  if (rowIndex === undefined || colIndex === undefined) {
    return undefined;
  }

  const rowElement = tableBody.children[rowIndex];
  const cellElement = rowElement?.children[colIndex] as HTMLElement | undefined;
  if (!cellElement) {
    return undefined;
  }

  return preserveCellRectSize({
    rect: cellElement.getBoundingClientRect(),
    originalSize,
  });
};

export const didReferencePositionsChange = ({
  previous,
  next,
}: {
  previous: Pick<
    TableHandlesState,
    'referencePosCell' | 'referencePosTable' | 'referencePosLastRow' | 'referencePosLastCol'
  >;
  next: Pick<
    TableHandlesState,
    'referencePosCell' | 'referencePosTable' | 'referencePosLastRow' | 'referencePosLastCol'
  >;
}) => {
  const sameRect = (left?: DOMRect, right?: DOMRect) => {
    if (!left && !right) return true;
    if (!left || !right) return false;
    return (
      left.x === right.x &&
      left.y === right.y &&
      left.width === right.width &&
      left.height === right.height
    );
  };

  return !(
    sameRect(previous.referencePosCell, next.referencePosCell) &&
    sameRect(previous.referencePosTable, next.referencePosTable) &&
    sameRect(previous.referencePosLastRow, next.referencePosLastRow) &&
    sameRect(previous.referencePosLastCol, next.referencePosLastCol)
  );
};
