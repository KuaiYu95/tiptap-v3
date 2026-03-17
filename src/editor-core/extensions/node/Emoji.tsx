import Emoji, { emojiToShortcode, gitHubEmojis, shortcodeToEmoji } from "@tiptap/extension-emoji";
import { emojiSuggestion } from "../suggestion/emoji";

const EMOJI_SHORTCODE_REGEX = /^:([a-zA-Z0-9_+-]+):/;

function extractEmojiName(token: any): string | null {
  if (token.name) {
    return token.name;
  }

  if (token.shortcode) {
    const emojiItem = shortcodeToEmoji(token.shortcode, gitHubEmojis);
    if (emojiItem) {
      return emojiItem.name;
    }
  }

  if (typeof token.markup === 'string' && token.markup.startsWith(':') && token.markup.endsWith(':')) {
    const shortcode = token.markup.slice(1, -1);
    const emojiItem = shortcodeToEmoji(shortcode, gitHubEmojis);
    if (emojiItem) {
      return emojiItem.name;
    }
  }

  if (typeof token.emoji === 'string' && token.emoji) {
    const shortcode = emojiToShortcode(token.emoji, gitHubEmojis);
    if (shortcode) {
      return shortcode;
    }
  }

  return null;
}

export const EmojiExtension = Emoji.extend({
  markdownTokenName: 'emoji',

  markdownTokenizer: {
    name: 'emoji',
    level: 'inline',
    start: (src: string) => src.indexOf(':'),
    tokenize(src: string, _tokens: unknown, helpers: unknown) {
      const match = EMOJI_SHORTCODE_REGEX.exec(src);
      if (!match) {
        return;
      }

      const shortcode = match[1];
      const emojiItem = shortcodeToEmoji(shortcode, gitHubEmojis);

      if (!emojiItem) {
        return;
      }

      return {
        type: 'emoji',
        raw: match[0],
        name: emojiItem.name,
        shortcode: shortcode,
        emoji: emojiItem.emoji || '',
      };
    },
  },

  parseMarkdown(token: any, helpers: any) {
    const name = extractEmojiName(token);

    if (!name) {
      return [];
    }

    return helpers.createNode('emoji', { name });
  },
}).configure({
  emojis: gitHubEmojis,
  enableEmoticons: true,
  suggestion: emojiSuggestion,
});