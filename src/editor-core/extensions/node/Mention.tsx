import { MentionExtensionProps } from "../../../types";
import Mention from "@tiptap/extension-mention";
import mentionSuggestion from "../suggestion/mention";

export const MentionExtension = (props: MentionExtensionProps) => Mention.configure({
  HTMLAttributes: {
    class: 'mention',
  },
  suggestion: mentionSuggestion(props),
});