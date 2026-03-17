import { EditorFnProps } from '../../../types'
import { removeBaseUrl, withBaseUrl } from '../../../utils'
import { InputRule, mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import AudioViewWrapper from '../component/Audio'
import { createAudioAttributes, renderAudioMarkdown } from '../component/Audio/shared'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audio: {
      /**
       * Insert an audio
       */
      setAudio: (options: {
        src: string
        title?: string
        poster?: string
        controls?: boolean
        autoplay?: boolean
        loop?: boolean
        muted?: boolean
      }) => ReturnType
    }
  }
}

export type AudioExtensionProps = EditorFnProps & { baseUrl: string }

export const AudioExtension = (props: AudioExtensionProps) => Node.create({
  name: 'audio',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addKeyboardShortcuts() {
    return {
      'Mod-4': () => {
        return this.editor.commands.setAudio({ src: '', controls: true, autoplay: false })
      }
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => withBaseUrl(element.getAttribute('src') || '', props.baseUrl),
        renderHTML: attributes => {
          if (!attributes.src) return {}
          return { src: removeBaseUrl(attributes.src, props.baseUrl) }
        },
      },
      title: {
        default: null,
        parseHTML: element => element.getAttribute('title'),
        renderHTML: attributes => {
          if (!attributes.title) return {}
          return { title: attributes.title }
        },
      },
      poster: {
        default: null,
        parseHTML: element => element.getAttribute('poster'),
        renderHTML: attributes => {
          if (!attributes.poster) return {}
          return { poster: attributes.poster }
        },
      },
      controls: {
        default: true,
        parseHTML: element => element.hasAttribute('controls'),
        renderHTML: attributes => {
          if (!attributes.controls) return {}
          return { controls: 'true' }
        },
      },
      autoplay: {
        default: false,
        parseHTML: element => element.hasAttribute('autoplay'),
        renderHTML: attributes => {
          if (!attributes.autoplay) return {}
          return { autoplay: 'true' }
        },
      },
      loop: {
        default: false,
        parseHTML: element => element.hasAttribute('loop'),
        renderHTML: attributes => {
          if (!attributes.loop) return {}
          return { loop: 'true' }
        },
      },
      muted: {
        default: false,
        parseHTML: element => element.hasAttribute('muted'),
        renderHTML: attributes => {
          if (!attributes.muted) return {}
          return { muted: 'true' }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'audio',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false

          const src = dom.getAttribute('src')
          if (!src) return false

          return {
            src,
            title: dom.getAttribute('title'),
            poster: dom.getAttribute('poster'),
            controls: dom.hasAttribute('controls'),
            autoplay: dom.hasAttribute('autoplay'),
            loop: dom.hasAttribute('loop'),
            muted: dom.hasAttribute('muted'),
          }
        },
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['audio', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  renderMarkdown(node) {
    return renderAudioMarkdown(createAudioAttributes(node.attrs as any))
  },

  addCommands() {
    return {
      setAudio: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: createAudioAttributes({
            src: options.src,
            title: options.title || null,
            poster: options.poster || null,
            controls: options.controls !== false,
            autoplay: options.autoplay || false,
            loop: options.loop || false,
            muted: options.muted || false,
          }),
        })
      },
    }
  },

  addInputRules() {
    return [
      new InputRule({
        find: /^https?:\/\/.*\.(mp3|wav|ogg|m4a|flac|aac|wma|webm)$/,
        handler: ({ range, match, commands }) => {
          const { from, to } = range
          const audioUrl = match[0]
          commands.insertContentAt({ from, to }, {
            type: this.name,
            attrs: { src: audioUrl },
          })
        },
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer((renderProps) => AudioViewWrapper({ ...renderProps, onUpload: props.onUpload, onError: props.onError, onValidateUrl: props.onValidateUrl }))
  },
})

export default AudioExtension
