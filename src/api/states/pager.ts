import { AbstractModel } from '../abstract-model'

export const page = <T extends AbstractModel>(
  result: T[],
  offset: number,
  size: number
): T[] => {
  const fromIndex = Math.max(0, offset)
  const toIndex = Math.min(result.length, fromIndex + Math.max(size, 0))

  if (fromIndex < result.length) {
    return result.slice(fromIndex, toIndex)
  } else {
    return []
  }
}
