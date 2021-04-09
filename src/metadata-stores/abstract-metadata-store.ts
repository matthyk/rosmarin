import { Constructor } from '../utility-types'

// inspired by https://github.com/typestack/class-transformer/blob/d2cf4da3504a5f0dd69eb19bb6f28f14780bc05c/src/MetadataStorage.ts#L239
export abstract class AbstractMetadataStore {
  protected mergeWithSuperClasses<T>(
    ctor: Constructor,
    data: Map<Constructor, T>,
    merge: (a: T, b: T) => T
  ): T {
    if (
      typeof ctor === 'undefined' ||
      ctor === null ||
      ctor?.prototype === 'undefined'
    )
      return data.get(ctor) // TODO fix abort condition

    return merge(
      data.get(ctor),
      this.mergeWithSuperClasses(Object.getPrototypeOf(ctor), data, merge)
    )
  }

  protected mergeMapWithArrays<T>(
    ctor: Constructor,
    data: Map<Constructor, T[]>
  ): T[] {
    return this.mergeWithSuperClasses(ctor, data, (a: T[], b: T[]) => {
      if (typeof a === 'undefined' && typeof b === 'undefined') {
        return []
      } else if (typeof a === 'undefined') {
        return b
      } else if (typeof b === 'undefined') {
        return a
      } else {
        return a.concat(b)
      }
    })
  }

  protected mergeMapWithRecord<T>(
    ctor: Constructor,
    data: Map<Constructor, Record<string, T>>
  ): Record<string, T> {
    return this.mergeWithSuperClasses(
      ctor,
      data,
      (a: Record<string, T>, b: Record<string, T>) => ({ ...b, ...a })
    )
  }
}
