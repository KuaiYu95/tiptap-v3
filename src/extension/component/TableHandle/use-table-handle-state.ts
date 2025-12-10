import type { Editor } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TableHandlesState } from '../../node/TableHandler/plugin';

export interface UseTableHandleStateConfig {
  /** Tiptap 编辑器实例；未传则使用外部上下文中的 editor */
  editor?: Editor | null;
  /** 手柄的初始状态 */
  initialState?: TableHandlesState | null;
  /** 仅在特定字段变动时触发更新 */
  watchFields?: (keyof TableHandlesState)[];
  /** 状态变更回调 */
  onStateChange?: (state: TableHandlesState | null) => void;
}

export function useTableHandleState(config: UseTableHandleStateConfig = {}) {
  const {
    editor: providedEditor,
    initialState = null,
    watchFields,
    onStateChange,
  } = config;

  const editor = providedEditor;
  const [state, setState] = useState<TableHandlesState | null>(initialState);
  const prevStateRef = useRef<TableHandlesState | null>(initialState);

  const updateState = useCallback(
    (newState: TableHandlesState) => {
      if (watchFields && prevStateRef.current) {
        const shouldUpdate = watchFields.some(
          (field) => prevStateRef.current![field] !== newState[field]
        );
        if (!shouldUpdate) return;
      }

      setState(newState);
      prevStateRef.current = newState;
      onStateChange?.(newState);
    },
    [watchFields, onStateChange]
  );

  useEffect(() => {
    if (!editor) {
      setState(null);
      prevStateRef.current = null;
      onStateChange?.(null);
      return;
    }

    editor.on('tableHandleState', updateState);

    return () => {
      editor.off('tableHandleState', updateState);
    };
  }, [editor, onStateChange, updateState]);

  return state;
}

