import { AbstractMetadataStore } from './abstract-metadata-store'
import { Property } from './property'
import { Constructor } from '../utility-types'

export abstract class AbstractPropertyStore<T> extends AbstractMetadataStore {
  private properties = new Map<Constructor<T>, Property[]>()

  public addProperty(ctor: Constructor<T>, property: Property): void {
    if (this.properties.has(ctor) === false) {
      this.properties.set(ctor, [])
    }

    this.properties.get(ctor).push(property)
  }

  public getProperties(ctor: Constructor<T>): Property[] {
    return this.mergeMapWithArrays(ctor, this.properties) ?? []
  }

  public getPropertyType<V>(
    ctor: Constructor<T>,
    propertyName: string
  ): Constructor<V> | undefined {
    const properties = this.getProperties(ctor)

    const property = properties.find(
      (prop: Property) => prop.name === propertyName
    )

    let type: Constructor<V> | undefined

    if (typeof property !== 'undefined') {
      if (typeof property.typeFn !== 'undefined') {
        type = property.typeFn() as Constructor<V>
      } else {
        type = property.type as Constructor<V>
      }
    }

    // Maybe the user did not annotate the property with the @modelProp annotation but maybe with another one so we can receive metadata for it
    if (typeof type === 'undefined') {
      type = Reflect.getMetadata('design:type', new ctor(), propertyName)
    }

    return type
  }

  public getArrayProperties(ctor: Constructor<T>): Property[] {
    return this.properties
      .get(ctor)
      .filter((prop: Property) => prop.type.name === 'Array')

    // return (this.mergeMapWithRecord(ctor, this.arrayProperties) ?? {}) as Record<string, TypeFn<V>>
    // return (this.arrayProperties.get(ctor) ?? {}) as Record<string, TypeFn<V>>
  }

  public isArrayProperty(ctor: Constructor<T>, propertyName: string): boolean {
    return this.getArrayProperties(ctor).some(
      (prop: Property) => prop.name === propertyName
    )
  }
}
