import 'reflect-metadata'

const prop = (target: Object, propertyKey: string): void => {
  const property = Reflect.getMetadata('design:type', target, propertyKey)

  const props = Reflect.getMetadata('PROPERTIES', target.constructor) ?? []

  props.push({ propertyKey, propertyType: property.name })

  Reflect.defineMetadata('PROPERTIES', props, target.constructor)
}

class Address {
  street: string
  place: symbol

  public test(): void {
    console.log('WOW')
  }
}

class User {
  @prop
  id: Address
  @prop
  as: string[]
}

const generateSchema = <T>(ctor: {
  new (...arg: any[]): T
}): Record<string, any> => {
  const schema: Record<string, any> = {
    type: 'object',
    properties: {},
  }

  const properties = Reflect.getMetadata('PROPERTIES', ctor)

  properties.forEach((prop: any) => {
    schema.properties[prop.propertyKey] = {
      type: prop.propertyType.toLowerCase(),
    }
  })

  return schema
}

/*
{
  type: "object",
  properties: {
    id: {
      type: "number"
    },
    name: {
      type: "string"
    }
  }
}
*/

const schema = generateSchema(User)
console.log(Reflect.getMetadata('PROPERTIES', User))
console.log('###########################################')
Reflect.deleteMetadata('PROPERTIES', User)
console.log(Reflect.getMetadata('PROPERTIES', User))
new User()
console.log('###########################################')
console.log(Reflect.getMetadata('PROPERTIES', User))
console.log('###########################################')

console.log(schema)
