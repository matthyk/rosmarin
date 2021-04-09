import { Constructor, Target } from '../../utility-types'
import { AbstractModel } from '../../models'
import { modelMetadataStore, TypeFn } from '../../metadata-stores'

export const modelProp = (typeFn?: TypeFn): PropertyDecorator => {
  return (target: Target, propertyKey: string | symbol) => {
    const reflectedType: Constructor = Reflect.getMetadata(
      'design:type',
      target,
      propertyKey
    )

    modelMetadataStore.addProperty(
      target.constructor as Constructor<AbstractModel>,
      {
        name: propertyKey.toString(),
        typeFn,
        type: reflectedType,
      }
    )
  }
}

export const modelArrayProp = (typeFn: TypeFn): PropertyDecorator => {
  return (target: Target, propertyKey: string | symbol) => {
    modelMetadataStore.addProperty(
      target.constructor as Constructor<AbstractModel>,
      {
        name: propertyKey.toString(),
        type: [].constructor as Constructor,
        typeFn,
      }
    )
  }
}
