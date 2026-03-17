import { PluginKey, Transaction } from '@tiptap/pm/state';

export interface ImeCompositionState {
  isComposing: boolean
}

export const IME_COMPOSITION_PLUGIN_KEY = new PluginKey<ImeCompositionState>('imeComposition');
export const IME_COMPOSITION_META_KEY = 'composition';
export const IME_COMPOSITION_START_META_KEY = 'compositionstart';
export const IME_COMPOSITION_END_META_KEY = 'compositionend';

export const isSafariBrowser = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent;
  const isAppleMobile = /iP(ad|hone|od)/.test(ua);
  const isMacSafari = /Safari\//.test(ua) && !/Chrome\//.test(ua);

  return isAppleMobile || isMacSafari;
};

export const isTextNode = (node: unknown): node is Text => !!node && (node as any).nodeType === 3;

export const hasImeCompositionMeta = (tr: Transaction) => (
  tr.getMeta(IME_COMPOSITION_META_KEY) ||
  tr.getMeta(IME_COMPOSITION_START_META_KEY) ||
  tr.getMeta(IME_COMPOSITION_END_META_KEY)
);
