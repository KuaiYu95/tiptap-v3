export const withBaseUrl = (url: string, baseUrl: string): string => {
  const trimmedUrl = url?.trim() ?? ''
  if (!trimmedUrl) return trimmedUrl

  const isAbsolute = /^([a-z][a-z\d+\-.]*:)?\/\//i.test(trimmedUrl) || trimmedUrl.startsWith('data:')
  if (isAbsolute) {
    return trimmedUrl
  }

  const trimmedBase = baseUrl?.trim() ?? ''
  if (!trimmedBase) {
    return trimmedUrl
  }

  if (trimmedUrl.startsWith(trimmedBase)) {
    return trimmedUrl
  }

  const baseEndsWithSlash = trimmedBase.endsWith('/')
  const urlStartsWithSlash = trimmedUrl.startsWith('/')
  if (baseEndsWithSlash && urlStartsWithSlash) {
    return `${trimmedBase.slice(0, -1)}${trimmedUrl}`
  } else if (!baseEndsWithSlash && !urlStartsWithSlash) {
    return `${trimmedBase}/${trimmedUrl}`
  } else {
    return `${trimmedBase}${trimmedUrl}`
  }
}

export const removeBaseUrl = (url: string, baseUrl: string): string => {
  const trimmedUrl = url?.trim() ?? ''
  if (!trimmedUrl) return trimmedUrl

  const trimmedBase = baseUrl?.trim() ?? ''
  if (!trimmedBase) {
    return trimmedUrl
  }

  if (trimmedUrl.startsWith(trimmedBase)) {
    return trimmedUrl.slice(trimmedBase.length)
  }

  return trimmedUrl
}
