import { Constructor } from '../types'
import { SchemaOptions } from '../api'
import {
  isArray,
  isObject,
  mergePropertyOptions,
  typeOfProperty,
} from './utils'
import { AbstractModel, AbstractViewModel } from '../models'
import {
  modelMetadataStore,
  validationMetadataStore,
  ValidationProperty,
  viewMetadataStore,
} from '../metadata-stores'
import { JsonSchema } from 'src/router/route-definitions'

const linkSchema: JsonSchema = {
  type: 'object',
  properties: {
    href: {
      type: 'string',
    },
    rel: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
  },
  required: ['href', 'rel'],
  additionalProperties: false,
}

const buildCollectionSchema = <
  T extends AbstractModel,
  V extends AbstractViewModel
>(
  model: Constructor<T>,
  view: Constructor<V>,
  schemaOptions: SchemaOptions
): JsonSchema => {
  const arraySchema: JsonSchema = {
    type: 'array',
    items: buildObjectSchema(model, view),
  }

  return { ...arraySchema, ...schemaOptions }
}

const buildArrayPropertySchema = <
  T extends AbstractModel,
  V extends AbstractViewModel
>(
  model: Constructor<T>,
  view: Constructor<V>,
  propertyName: string,
  schemaOptions: SchemaOptions
): JsonSchema => {
  const type: Constructor<AbstractViewModel> = viewMetadataStore.getPropertyType(
    view,
    propertyName
  )

  let items

  // TODO: support nested arrays
  if (isObject(type)) {
    items = buildObjectSchema(model, type)
  } else {
    items = { type: type.name.toLowerCase() }
  }

  const arraySchema: JsonSchema = {
    type: 'array',
    items,
  }

  return { ...arraySchema, ...schemaOptions }
}

const buildObjectSchema = <
  T extends AbstractModel,
  V extends AbstractViewModel
>(
  model: Constructor<T>,
  view: Constructor<V>
): JsonSchema => {
  const validationProperties: ValidationProperty[] = validationMetadataStore.getProperties(
    view
  )
  const schemaOptions = validationMetadataStore.getSchemaForView(view)
  const linkProperties = modelMetadataStore.getLinkProperties(model)

  const objectSchema: JsonSchema = {
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
  }

  for (const linkProp of linkProperties) {
    objectSchema.required.push(linkProp.property)

    objectSchema.properties[linkProp.property] = linkSchema
  }

  for (const prop of validationProperties) {
    const { required, ...options } = prop.schemaOptions

    if (
      (typeof required === 'undefined' || required === true) &&
      objectSchema.required.includes(prop.name) === false
    ) {
      objectSchema.required.push(prop.name)
    }

    const type: Constructor<AbstractViewModel> = typeOfProperty(prop)

    if (Object.keys(prop.schemaOptions).length !== 0) {
      objectSchema.properties[prop.name] = options
    } else if (isArray(prop.type)) {
      const TypeInModel: Constructor<AbstractModel> = modelMetadataStore.getPropertyType(
        model,
        prop.name
      )

      objectSchema.properties[prop.name] = buildArrayPropertySchema(
        TypeInModel,
        view,
        prop.name,
        prop.schemaOptions
      )
    } else if (isObject(type)) {
      const TypeInModel: Constructor<AbstractModel> = modelMetadataStore.getPropertyType(
        model,
        prop.name
      )

      objectSchema.properties[prop.name] = buildObjectSchema(TypeInModel, type)
    } else {
      objectSchema.properties[prop.name] = mergePropertyOptions(
        type,
        prop.schemaOptions
      )
    }
  }

  return { ...objectSchema, ...schemaOptions }
}

export const buildSerializationSchema = <
  T extends AbstractModel,
  V extends AbstractViewModel
>(
  from: Constructor<T>,
  to: Constructor<V>
): JsonSchema => {
  const schemaOptions: SchemaOptions = validationMetadataStore.getSchemaForCollectionView(
    to
  )

  // Schema is an object or an array. If a view class is annotated with @collectionView we assume that the user want to
  // send an JSON array with the annotated class as item type
  if (typeof schemaOptions !== 'undefined') {
    return buildCollectionSchema(from, to, schemaOptions)
  } else {
    return buildObjectSchema(from, to)
  }
}
