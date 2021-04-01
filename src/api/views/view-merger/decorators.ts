import { Constructor, Target } from '../../../router/utility-types'
import { ValidationProperty } from '../../../json-schema-builder/view-property'
import { Type } from 'class-transformer'
import constants from '../../../constants'

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

const setValidationMetadata = (
  target: Target,
  propertyKey: string | symbol,
  schemaOptions: Record<string, any>
): void => {
  const property = Reflect.getMetadata('design:type', target, propertyKey)

  const props = (Reflect.getMetadata(
    constants.VALIDATION_PROPERTIES_METADATA,
    target.constructor
  ) ?? []) as ValidationProperty[]

  props.push({
    name: propertyKey.toString(),
    type: schemaOptions.type ?? property,
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

  schemaOptions.type = [].constructor

  setValidationMetadata(target, propertyKey, schemaOptions)

  Reflect.decorate([Type(() => type)], target, propertyKey)
}

export const viewProp = (
  schemaOptions: Record<string, any> = {}
): PropertyDecorator => (
  target: Target,
  propertyKey: string | symbol
): void => {
  Reflect.decorate([Type()], target, propertyKey) // Required? Yes it is required !! lol

  setViewPropertyMetadata(target, propertyKey)

  setValidationMetadata(target, propertyKey, schemaOptions)
}
