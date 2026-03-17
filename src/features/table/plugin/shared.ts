import type { Editor } from '@tiptap/core';
import type { Node as TiptapNode } from '@tiptap/pm/model';
import { PluginKey } from '@tiptap/pm/state';

export type TableHandlesState = {
  show: boolean;
  showAddOrRemoveRowsButton: boolean;
  showAddOrRemoveColumnsButton: boolean;
  referencePosCell?: DOMRect;
  referencePosTable: DOMRect;
  referencePosLastRow?: DOMRect;
  referencePosLastCol?: DOMRect;
  block: TiptapNode;
  blockPos: number;
  colIndex: number | undefined;
  rowIndex: number | undefined;
  draggingState?:
  | {
    draggedCellOrientation: 'row' | 'col';
    originalIndex: number;
    mousePos: number;
    initialOffset: number;
    originalCellSize?: { width: number; height: number };
  }
  | undefined;
  widgetContainer: HTMLElement | undefined;
  _cachedHandleRects?: DOMRect[];
  _cachedHandleRectsTime?: number;
};

export interface TableHandleRuntime {
  editor: Editor;
  state: TableHandlesState | undefined;
  emitUpdate: () => void;
}

export const tableHandlePluginKey = new PluginKey('tableHandlePlugin');

let tableHandleRuntime: TableHandleRuntime | null = null;

export const setTableHandleRuntime = (runtime: TableHandleRuntime | null) => {
  tableHandleRuntime = runtime;
};

export const getTableHandleRuntime = () => tableHandleRuntime;
