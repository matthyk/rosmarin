import { Constructor } from '../router/utility-types'
import { ValidationProperty } from './view-property'
import constants from '../constants'
import { SchemaOptions } from './decorators'

export type Schema = Record<string, any>

const isObject = <T>(type: Constructor<T>): boolean => {
  const typeName = type.name.toLowerCase()
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

const isArray = <T>(type: Constructor<T>): boolean => type.name === 'Array'

const mergePropertyOptions = <T>(
  type: Constructor<T>,
  options: SchemaOptions
): Schema => {
  const mergedResult: Schema = { type: type.name.toLowerCase(), ...options }

  delete mergedResult.required

  return mergedResult
}

const buildArraySchema = <T>(
  ctor: Constructor<T>,
  propKey: string | symbol,
  schemaOptions: SchemaOptions
): Schema => {
  const metaData = Reflect.getMetadata(constants.VIEW_ARRAY_PROPS, ctor) ?? {}

  let items

  if (isObject(metaData[propKey])) {
    items = buildObjectSchema(metaData[propKey])
  } else {
    items = { type: metaData[propKey].name.toLowerCase() }
  }

  const arraySchema: Schema = {
    type: 'array',
    items,
  }

  return { ...arraySchema, ...schemaOptions }
}

const buildObjectSchema = <T>(ctor: Constructor<T>): Schema => {
  const validationProps: ValidationProperty[] = (Reflect.getMetadata(
    constants.VALIDATION_PROPERTIES_METADATA,
    ctor
  ) ?? []) as ValidationProperty[]
  const schemaOptions: SchemaOptions = (Reflect.getMetadata(
    constants.VALIDATION_CLASS_METADATA,
    ctor
  ) ?? {}) as SchemaOptions

  const objectSchema: Schema = {
    type: 'object',
    title: ctor.name,
    $id: `${ctor.name.toLowerCase()}.schema`,
    properties: {},
    required: [],
    additionalProperties: false,
  }

  for (const prop of validationProps) {
    if (!(prop.schemaOptions?.required === false)) {
      objectSchema.required.push(prop.name)
    }

    // property is an array, an object or a primitive type
    if (isArray(prop.type)) {
      objectSchema.properties[prop.name] = buildArraySchema(
        ctor,
        prop.name,
        prop.schemaOptions
      )
    } else if (isObject(prop.type)) {
      objectSchema.properties[prop.name] = buildObjectSchema(prop.type)
    } else {
      objectSchema.properties[prop.name] = mergePropertyOptions(
        prop.type,
        prop.schemaOptions
      )
    }
  }

  return { ...objectSchema, ...schemaOptions }
}

export const buildSchema = <T>(ctor: Constructor<T>): Schema => {
  return buildObjectSchema(ctor)
}
