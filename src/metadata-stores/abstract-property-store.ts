import { Property } from './property'
import { Constructor } from '../types'

/**
 * We take the overhead at build time to avoid the time-consuming search for properties in all super classes at runtime.
 */
export abstract class AbstractPropertyStore<T, P extends Property> {
  private properties = new Map<Constructor<T>, P[]>()

  public addProperty(ctor: Constructor<T>, property: P): void {
    if (this.properties.has(ctor) === false) {
      this.properties.set(ctor, [])
    }

    this.searchInSuperClasses(ctor, this.properties.get(ctor))

    this.addPropertyInternal(ctor, property)
  }

  private addPropertyInternal(ctor: Constructor<T>, property: P): void {
    const currentProperties = this.properties.get(ctor)

    const idx = currentProperties.findIndex(
      (prop: P) => prop.name === property.name
    )

    if (idx < 0) {
      currentProperties.push(property)
    } else {
      currentProperties[idx] = property
    }
  }

  public getProperties(ctor: Constructor<T>): P[] {
    const properties = this.properties.get(ctor)

    return properties
      ? properties
      : this.properties.get(Object.getPrototypeOf(ctor)) ?? []
  }

  public getPropertyType<V>(
    ctor: Constructor<T>,
    propertyName: string
  ): Constructor<V> | undefined {
    const properties = this.getProperties(ctor)

    const property = properties.find((prop: P) => prop.name === propertyName)

    let type: Constructor<V> | undefined

    if (typeof property !== 'undefined') {
      if (typeof property.typeFn !== 'undefined') {
        type = property.typeFn() as Constructor<V>
      } else {
        type = property.type as Constructor<V>
      }
    }

    // Maybe the user did not annotate the property with the @modelProp annotation but with another one so we can receive metadata for it
    if (typeof type === 'undefined') {
      type = Reflect.getMetadata('design:type', new ctor(), propertyName)
    }

    return type
  }

  public getProperty(
    ctor: Constructor<T>,
    propertyName: string
  ): P | undefined {
    return this.getProperties(ctor).find(
      (prop: P) => prop.name === propertyName
    )
  }

  public getArrayProperties(ctor: Constructor<T>): P[] {
    return this.getProperties(ctor).filter(
      (prop: Property) => prop.type.name === 'Array'
    )
  }

  public isArrayProperty(ctor: Constructor<T>, propertyName: string): boolean {
    return this.getArrayProperties(ctor).some(
      (prop: Property) => prop.name === propertyName
    )
  }

  protected searchInSuperClasses(ctor: Constructor, data: P[]): void {
    const prototype = Object.getPrototypeOf(ctor)

    const prototypeProperties = this.properties.get(prototype) ?? []

    // Add property only if a property with the same name does not exist
    // if a property has been overridden in an inheritance hierarchy, we take the property definition furthest down the hierarchy
    prototypeProperties
      .filter(
        (property: P) =>
          typeof data.find((prop: P) => prop.name === property.name) ===
          'undefined'
      )
      .forEach((property: P) => data.push(property))

    // if prototype is function or object it is no longer a class created by
    // the user and the recursion should be terminated
    if (
      prototype.constructor.name === 'Function' ||
      prototype.constructor.name === 'Object'
    )
      return

    this.searchInSuperClasses(prototype, data)
  }
}
