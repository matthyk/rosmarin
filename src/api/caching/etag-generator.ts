import etag from 'etag'

export const createEtag = (object: unknown): string => {
  return etag(JSON.stringify(object)) // TODO use more performant lib and JSON.stringify() should be avoided
}
