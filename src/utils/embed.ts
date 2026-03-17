export const extractSrcFromIframe = (input: string): string => {
  const trimmed = input.trim()
  const iframeMatch = trimmed.match(/<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["'][^>]*>/i)
    || trimmed.match(/<iframe[^>]*\ssrc\s*=\s*([^\s>]+)[^>]*>/i)

  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1].trim()
  }

  return trimmed
}

export const normalizeBilibiliAutoplay = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return trimmed

  try {
    const urlToParse = trimmed.startsWith('//')
      ? 'https:' + trimmed
      : /^https?:\/\//i.test(trimmed)
        ? trimmed
        : 'https://' + trimmed
    const parsedUrl = new URL(urlToParse)
    const host = parsedUrl.hostname.toLowerCase()

    if (!host.includes('bilibili.com') && !host.includes('b23.tv')) {
      return trimmed
    }

    const autoplay = parsedUrl.searchParams.get('autoplay')
    if (autoplay !== '0') {
      parsedUrl.searchParams.set('autoplay', '0')
    }

    return parsedUrl.toString()
  } catch {
    return trimmed
  }
}
