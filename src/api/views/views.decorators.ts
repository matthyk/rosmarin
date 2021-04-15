import { Type } from 'class-transformer'
import { Constructor, Target } from '../../types'
import {
  validationMetadataStore,
  viewMetadataStore,
  ValidationProperty,
  TypeFn,
} from '../../metadata-stores'
import { AbstractViewModel } from '../../models'

export type SchemaOptions = Record<string, any>

export const viewArrayProp = (
  typeFn: TypeFn,
  schemaOptions: SchemaOptions = {}
): PropertyDecorator => (
  target: Target,
  propertyKey: string | symbol
): void => {
  Reflect.decorate([Type(typeFn)], target, propertyKey)

  viewMetadataStore.addProperty(
    target.constructor as Constructor<AbstractViewModel>,
    {
      name: propertyKey.toString(),
      type: [].constructor as Constructor,
      typeFn,
    }
  )

  const validationProperty: ValidationProperty = {
    name: propertyKey.toString(),
    type: [].constructor as Constructor,
    typeFn: typeFn,
    schemaOptions,
  }

  validationMetadataStore.addProperty(
    target.constructor as Constructor<AbstractViewModel>,
    validationProperty
  )
}

export const viewProp = (
  schemaOptions: SchemaOptions = {},
  typeFn?: TypeFn
): PropertyDecorator => (
  target: Target,
  propertyKey: string | symbol
): void => {
  const reflectedType = Reflect.getMetadata('design:type', target, propertyKey)

  Reflect.decorate([Type(typeFn)], target, propertyKey)

  viewMetadataStore.addProperty(
    target.constructor as Constructor<AbstractViewModel>,
    {
      name: propertyKey.toString(),
      typeFn: typeFn,
      type: reflectedType,
    }
  )

  validationMetadataStore.addProperty(
    target.constructor as Constructor<AbstractViewModel>,
    {
      name: propertyKey.toString(),
      typeFn: typeFn,
      type: reflectedType,
      schemaOptions,
    }
  )
}

export const view = (schemaOptions: SchemaOptions): ClassDecorator => {
  return (target: Target) =>
    validationMetadataStore.addSchemaForView(
      target as Constructor<AbstractViewModel>,
      schemaOptions
    )
}

export const collectionView = (
  schemaOptions: SchemaOptions = {}
): ClassDecorator => {
  return (target: Target) => {
    validationMetadataStore.addSchemaForCollectionView(
      target as Constructor<AbstractViewModel>,
      schemaOptions
    )
  }
}
