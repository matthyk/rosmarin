export const linkHeader = (
  uri: string,
  rel: string,
  mediaType?: string
): string => {
  return mediaType
    ? `<${uri}>;rel="${rel}";type="${mediaType}"`
    : `<${uri}>;rel="${rel}";`
}

export const buildLink = (
  uriTemplate: string,
  relType: string,
  mediaTypeOrParams: string | unknown[],
  params?: unknown[]
): string => {
  if (Array.isArray(mediaTypeOrParams)) {
    params = mediaTypeOrParams
    mediaTypeOrParams = undefined
  }

  let link = uriTemplate
  if (params?.length > 0) {
    let counter = 0
    link = uriTemplate.replace(/\{.*?\}/g, (_: string) =>
      String(params[counter++])
    )
  }
  return linkHeader(link, relType, mediaTypeOrParams as string)
}
