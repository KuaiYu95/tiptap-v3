import { Theme } from '@mui/material';
import { MenuItem } from '../../types';
import { cancelNodeType, selectCurrentNode } from './node-actions';
import { buildConvertActions } from './convert-builders';
import { buildDownloadActions } from './download-builders';
import { buildStyleActions } from './style-builders';
import { CurrentNodeInfo, CurrentState, DragHandleActionGroup, ResourceState } from './types';

type BuildDragHandleActionGroupsProps = {
  current: CurrentState;
  currentNode: CurrentNodeInfo;
  resources: ResourceState;
  theme: Theme;
  more?: MenuItem[];
};

export const buildDragHandleActionGroups = ({
  current,
  currentNode,
  resources,
  theme,
  more,
}: BuildDragHandleActionGroupsProps): DragHandleActionGroup[] => {
  const groups: DragHandleActionGroup[] = [
    {
      id: 'style',
      items: buildStyleActions({
        current,
        currentNode,
        theme,
      }),
    },
    {
      id: 'convert',
      items: buildConvertActions({
        current,
        currentNode,
        selectCurrentNode: () => selectCurrentNode(current),
        cancelNodeType: () => cancelNodeType(current),
      }),
    },
    {
      id: 'download',
      items: buildDownloadActions({
        current,
        currentNode,
        resources,
      }),
    },
    {
      id: 'custom',
      items: more ?? [],
    },
  ];

  return groups.filter((group) => group.items.length > 0);
};

export const flattenDragHandleActionGroups = (
  groups: DragHandleActionGroup[],
): MenuItem[] => groups.flatMap((group) => group.items);
