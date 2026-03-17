import Youtube, { YoutubeOptions } from "@tiptap/extension-youtube";

export const YoutubeExtension = (youtubeOptions?: Partial<YoutubeOptions>) => Youtube.configure({
  ccLanguage: 'zh-CN',
  nocookie: true,
  ...youtubeOptions
})

export default YoutubeExtension;