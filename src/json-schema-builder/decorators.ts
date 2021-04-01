import { Type } from 'class-transformer'
import constants from '../constants'
import { Constructor, Target } from '../router/utility-types'
import { ValidationProperty } from './view-property'

export type SchemaOptions = Record<string, any>

const setViewPropertyMetadata = (
  target: Target,
  propertyKey: string | symbol
): void => {
  const property = Reflect.getMetadata('design:type', target, propertyKey)

  const props =
    Reflect.getMetadata(constants.VIEW_PROPS, target.constructor) ?? []

  props.push({ key: propertyKey, type: property })

  Reflect.defineMetadata(constants.VIEW_PROPS, props, target.constructor)
}

const setSchemaMetadata = (
  target: Target,
  propertyKey: string | symbol,
  schemaOptions: SchemaOptions,
  type?: Constructor | undefined
): void => {
  const property = Reflect.getMetadata('design:type', target, propertyKey)

  const props = (Reflect.getMetadata(
    constants.VALIDATION_PROPERTIES_METADATA,
    target.constructor
  ) ?? []) as ValidationProperty[]

  props.push({
    name: propertyKey.toString(),
    type: type ? type : schemaOptions.type ?? property,
    schemaOptions,
  })

  Reflect.defineMetadata(
    constants.VALIDATION_PROPERTIES_METADATA,
    props,
    target.constructor
  )
}

export const viewArrayProp = (
  type: Constructor,
  schemaOptions: Record<string, any> = {}
): PropertyDecorator => (
  target: Target,
  propertyKey: string | symbol
): void => {
  const metaData =
    Reflect.getMetadata(constants.VIEW_ARRAY_PROPS, target.constructor) ?? {}

  metaData[propertyKey] = type

  Reflect.defineMetadata(
    constants.VIEW_ARRAY_PROPS,
    metaData,
    target.constructor
  )

  setViewPropertyMetadata(target, propertyKey)

  setSchemaMetadata(
    target,
    propertyKey,
    schemaOptions,
    <Constructor>[].constructor
  )

  Reflect.decorate([Type(() => type)], target, propertyKey)
}

export const viewProp = (
  schemaOptions: SchemaOptions = {}
): PropertyDecorator => (
  target: Target,
  propertyKey: string | symbol
): void => {
  Reflect.decorate([Type()], target, propertyKey) // Required? Yes it is required !! lol

  setViewPropertyMetadata(target, propertyKey)

  setSchemaMetadata(target, propertyKey, schemaOptions)
}

export const view = (schemaOptions: SchemaOptions = {}): ClassDecorator => {
  return (target: Target) => {
    Reflect.defineMetadata(
      constants.VALIDATION_CLASS_METADATA,
      schemaOptions,
      target
    )
  }
}

export const collectionView = (schemaOptions: SchemaOptions = {}): ClassDecorator =>{
  return (target: Target) => {
    Reflect.defineMetadata(
      constants.VALIDATION_CLASS_METADATA_COLLECTION,
      schemaOptions,
      target
    )
  }
}
