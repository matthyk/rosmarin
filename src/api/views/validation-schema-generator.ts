import { Target } from '../../routing/utility-types'

export const property = (
  _config: Record<string, any> = {}
): PropertyDecorator => {
  return (target: Target, propertyKey: string | symbol): void => {
    const propertyType = Reflect.getMetadata('design:type', target, propertyKey)
      .name

    const props = Reflect.getMetadata('PROPERTIES', target.constructor) ?? []

    props.push({ propertyKey, propertyType })

    Reflect.defineMetadata('PROPERTIES', props, target.constructor)
  }
}
