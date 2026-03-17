import { GetExtensionsProps } from '../../types';
import {
  createExtensionLayers,
  flattenExtensionLayers,
} from './builders';

export const getExtensions = (props: GetExtensionsProps) => {
  return flattenExtensionLayers(createExtensionLayers(props));
};

export * from './catalog';
export * from './builders';
