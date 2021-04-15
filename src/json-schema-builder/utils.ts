import { Constructor } from '../types'
import { SchemaOptions } from '../api'
import { Property } from '../metadata-stores'
import { JsonSchema } from '../router/route-definitions'

export const isObject = <T>(type: Constructor<T>): boolean => {
  const typeName = type?.name?.toLowerCase()
  return (
    typeName !== 'string' &&
    typeName !== 'boolean' &&
    typeName !== 'number' &&
    typeName !== 'bigint' &&
    typeName !== 'boolean' &&
    typeName !== 'symbol' &&
    typeName !== 'object' &&
    typeName !== 'function' &&
    !isArray(type)
  )
}

export const isArray = <T>(type: Constructor<T>): boolean =>
  type?.name === 'Array'

export const mergePropertyOptions = <T>(
  type: Constructor<T>,
  options: SchemaOptions
): JsonSchema => {
  const mergedResult: JsonSchema = { type: type.name.toLowerCase(), ...options }

  delete mergedResult.required

  return mergedResult
}

export const typeOfProperty = <T>(property: Property): Constructor<T> => {
  if (typeof property.typeFn === 'function')
    return property.typeFn() as Constructor<T>

  return property.type as Constructor<T>
}
