export async function resolve(specifier, context, defaultResolve) {
  try {
    return await defaultResolve(specifier, context, defaultResolve)
  } catch (error) {
    const isRelativeSpecifier = specifier === '.'
      || specifier === '..'
      || specifier.startsWith('./')
      || specifier.startsWith('../')
    const hasKnownExtension = /\.[a-z0-9]+$/i.test(specifier)
    const normalizedSpecifier = specifier.endsWith('/')
      ? specifier.slice(0, -1)
      : specifier
    const directoryCandidate = `${normalizedSpecifier}/index.js`

    const tryResolveCandidates = async (candidates) => {
      let lastError = null

      for (const candidate of candidates) {
        try {
          return await defaultResolve(candidate, context, defaultResolve)
        } catch (candidateError) {
          lastError = candidateError
        }
      }

      throw lastError
    }

    if (
      error?.code === 'ERR_MODULE_NOT_FOUND' &&
      isRelativeSpecifier &&
      !hasKnownExtension
    ) {
      return tryResolveCandidates([
        `${normalizedSpecifier}.js`,
        directoryCandidate,
      ])
    }

    if (
      error?.code === 'ERR_UNSUPPORTED_DIR_IMPORT' &&
      isRelativeSpecifier &&
      !hasKnownExtension
    ) {
      return tryResolveCandidates([directoryCandidate])
    }

    throw error
  }
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith('.css')) {
    return {
      format: 'module',
      source: 'export default {}',
      shortCircuit: true,
    }
  }

  return defaultLoad(url, context, defaultLoad)
}
