import { Constructor } from '../utility-types'
import { SchemaOptions } from '../api'
import { isArray, isObject, typeOfProperty } from './utils'
import {
  validationMetadataStore,
  ValidationProperty,
  viewMetadataStore,
} from '../metadata-stores'
import { AbstractViewModel } from '../models'
import { JsonSchema } from 'src/router/route-definitions'

export const buildCollectionSchema = <T extends AbstractViewModel>(
  ctor: Constructor<T>,
  schemaOptions: SchemaOptions
): JsonSchema => {
  const arraySchema: JsonSchema = {
    type: 'array',
    items: buildObjectSchema(ctor),
  }

  return { ...arraySchema, ...schemaOptions }
}

export const buildArrayPropertySchema = <T extends AbstractViewModel>(
  ctor: Constructor<T>,
  propertyName: string
): JsonSchema => {
  const type: Constructor<AbstractViewModel> = viewMetadataStore.getPropertyType(
    ctor,
    propertyName
  )

  let items

  // TODO: check if TypeFn is undefined
  // TODO: support nested array
  if (isObject(type)) {
    items = buildObjectSchema(type)
  } else {
    items = { type: type.name.toLowerCase() }
  }

  return {
    type: 'array',
    items,
  }
}

export const buildObjectSchema = <T extends AbstractViewModel>(
  ctor: Constructor<T>
): JsonSchema => {
  const validationProperties: ValidationProperty[] = validationMetadataStore.getProperties(
    ctor
  )
  const schemaOptions: SchemaOptions = validationMetadataStore.getSchemaForView(
    ctor
  )

  const objectSchema: JsonSchema = {
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
  }

  for (const prop of validationProperties) {
    const { required, ...options } = prop.schemaOptions

    if (typeof required === 'undefined' || required === true) {
      objectSchema.required.push(prop.name)
    }

    const type: Constructor<AbstractViewModel> = typeOfProperty(prop)

    if (Object.keys(prop.schemaOptions).length !== 0) {
      objectSchema.properties[prop.name] = options
    } else if (isArray(prop.type)) {
      objectSchema.properties[prop.name] = buildArrayPropertySchema(
        ctor,
        prop.name
      )
    } else if (isObject(type)) {
      objectSchema.properties[prop.name] = buildObjectSchema(type)
    } else {
      objectSchema.properties[prop.name] = { type: type.name.toLowerCase() }
    }
  }

  return { ...objectSchema, ...schemaOptions }
}

export const buildValidationSchema = <T extends AbstractViewModel>(
  ctor: Constructor<T>
): JsonSchema => {
  const schemaOptions: SchemaOptions = validationMetadataStore.getSchemaForCollectionView(
    ctor
  )

  // Schema is an object or an array. If a view class is annotated with @collectionView we assume that the user want to
  // send an JSON array with the annotated class as item type
  if (typeof schemaOptions !== 'undefined') {
    return buildCollectionSchema(ctor, schemaOptions)
  } else {
    return buildObjectSchema(ctor)
  }
}
