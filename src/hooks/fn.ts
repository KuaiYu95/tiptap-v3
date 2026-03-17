import { JSONContent } from "@tiptap/core"
import { generateHTML, generateJSON } from "@tiptap/html"
import { renderToHTMLString, renderToMarkdown, renderToReactElement } from "@tiptap/static-renderer"
import { getExtensions } from "../editor-core/extensions"

export interface UseFnProps {
  exclude?: string[]
}

export const useFn = ({
  exclude,
}: UseFnProps) => {

  const extensions = getExtensions({
    exclude,
    editable: false,
  })

  return {
    extensions,
    getJSONByHTML: (html: string) => generateJSON(html, extensions),
    getHTMLByJSON: (json: JSONContent) => generateHTML(json, extensions),
    getStaticRenderToHTMLStringByJSON: (json: JSONContent) => renderToHTMLString({ content: json, extensions }),
    getStaticRenderToMarkdownByJSON: (json: JSONContent) => renderToMarkdown({ content: json, extensions }),
    getStaticRenderToReactElementByJSON: (json: JSONContent) => renderToReactElement({ content: json, extensions }),
  }
}