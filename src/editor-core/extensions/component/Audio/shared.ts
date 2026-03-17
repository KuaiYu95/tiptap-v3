import { escapeHtmlAttribute } from '../../node/resource-shared';

export interface AudioAttributes {
  src: string;
  title?: string | null;
  poster?: string | null;
  controls: boolean;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
}

export const createAudioAttributes = (
  base: AudioAttributes,
  overrides: Partial<AudioAttributes> = {},
): AudioAttributes => ({
  src: base.src,
  title: base.title ?? null,
  poster: base.poster ?? null,
  controls: base.controls,
  autoplay: base.autoplay,
  loop: base.loop,
  muted: base.muted,
  ...overrides,
});

export const renderAudioMarkdown = (attrs: AudioAttributes) => {
  if (!attrs.src) {
    return '';
  }

  const parts = [`src="${escapeHtmlAttribute(attrs.src)}"`];

  if (attrs.title) {
    parts.push(`title="${escapeHtmlAttribute(attrs.title)}"`);
  }

  if (attrs.poster) {
    parts.push(`poster="${escapeHtmlAttribute(attrs.poster)}"`);
  }

  if (attrs.controls) {
    parts.push('controls');
  }

  if (attrs.autoplay) {
    parts.push('autoplay');
  }

  if (attrs.loop) {
    parts.push('loop');
  }

  if (attrs.muted) {
    parts.push('muted');
  }

  return `<audio ${parts.join(' ')}></audio>`;
};

export const getAudioDownloadName = (attrs: Pick<AudioAttributes, 'src' | 'title'>) =>
  attrs.title || attrs.src.split('/').pop() || 'audio.mp3';
