import 'reflect-metadata'
import { AbstractModel } from "../abstract-model";
import { Constructor, Target } from "../../routing/utility-types";
import { ModelId } from "../types";
// import merge from 'merge'

// "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"

interface Property {
  key: string
  type: Constructor
}

const isPrimitiveValue = (value: unknown): boolean => (typeof value !== 'object' && typeof value !== 'function') || value === null

const shouldMergeProperty = (propertyName: string): boolean => propertyName !== 'id' && propertyName !== 'lastModifiedAt'

const deletePropertyInObject = (object: any, key: string | symbol): void => {
  object[key] = undefined
}

const copyFromSourceToTarget = (source: any, target: any, key: string | symbol): void => {
  target[key] = source[key]
}



const merge2punkt0 = <T extends AbstractModel>(source: AbstractModel, target: T): T => {
  const sourceProperties: Property[] =
    Reflect.getMetadata('PROPERTIES', source.constructor) ?? []

  for (const sourceProperty of sourceProperties) {
    const propertyName: string = sourceProperty.key

    if (shouldMergeProperty(propertyName) === false) {
      continue
    }

    const propertyValueInSource = (source as any)[propertyName]

    if (typeof propertyValueInSource === 'undefined') {
      deletePropertyInObject(target, propertyName)
    }
    else if (isPrimitiveValue(propertyValueInSource)) {
      copyFromSourceToTarget(source, target, propertyName)
    }
    else if (typeof propertyValueInSource === 'object') {
      // is embedded collection resource?
      if (Array.isArray(propertyValueInSource)) {
        let propertyValueInTarget: any[] = (target as any)[propertyName]

        // this should never happen, but if it does the property in the target is simply deleted
        if (Array.isArray(propertyValueInTarget) === false) propertyValueInTarget = []

        for (const resource of propertyValueInSource) {
          const resourceId: ModelId = resource.id

          // check if this resource also exists in the target model
          const found: unknown | undefined = propertyValueInTarget.find((value: any) => value.id == resourceId) // TODO how should we search for this?

          // if it does not exist we have to instantiate it
          if (typeof found === 'undefined') {
            // for this we need the type so we need metadata of this property
            const metaData: any = Reflect.getMetadata('ARRAY_PROPS', target.constructor)
            const typeOfProperty = metaData[propertyName]

            const newInstance = new typeOfProperty()

            propertyValueInTarget.push(newInstance)

            merge2punkt0(resource, newInstance)
          } else {
            merge2punkt0(resource, found as AbstractModel)
          }
        }

        for (let i = 0; i < propertyValueInTarget.length; i++) {
          const resourceId = propertyValueInTarget[i].id

          if (typeof propertyValueInSource.find(e => e.id == resourceId) === 'undefined') {
            propertyValueInTarget.splice(i, 1)
          }
        }

        // copyFromSourceToTarget(source, target, propertyName)
      }
      else {
        // object property is not set in the target model and has to be instantiated
        if (typeof (target as any)[propertyName] === 'undefined') {
          // to do this we need the type of this property in the target model
          const typeInTarget: Constructor = Reflect.getMetadata('design:type', target, propertyName) as Constructor

          (target as any)[propertyName] = new typeInTarget();
          // normally the 'id' attribute is ignored but should be set here
          copyFromSourceToTarget((source as any)[propertyName], (target as any)[propertyName], 'id')
        }
        // then just continue to merge
        merge2punkt0((source as any)[propertyName], (target as any)[propertyName])
      }
    }
    else {
      /* type of property is function and is ignored */
    }
  }
  return target
}

export const arrayProp = (type: Constructor): PropertyDecorator => {
  return (target: Target, propertyKey: string | symbol): void => {
    const metaData = Reflect.getMetadata('ARRAY_PROPS', target.constructor) ?? {}

    metaData[propertyKey] = type

    Reflect.defineMetadata('ARRAY_PROPS', metaData, target.constructor)

    prop(target, propertyKey)
  }
}


const prop = (target: Target, propertyKey: string | symbol): void => {
  const property = Reflect.getMetadata('design:type', target, propertyKey)

  const props = Reflect.getMetadata('PROPERTIES', target.constructor) ?? []

  props.push({ key: propertyKey, type: property })

  Reflect.defineMetadata('PROPERTIES', props, target.constructor)
}

/*
export const merge = <T extends AbstractModel>(source: AbstractModel, target: T): T => {
  const sourceProperties: Property[] =
    Reflect.getMetadata('PROPERTIES', source.constructor) ?? []

  for (let i = 0; i < sourceProperties.length; i++) {
    if (sourceProperties[i].key === 'id' || sourceProperties[i].key === 'lastModifiedAt') continue

    const propInSource: unknown = (source as any)[sourceProperties[i].key]

    if (typeof propInSource === 'undefined') {
      (target as any)[sourceProperties[i].key] = undefined // or delete ?
    } else if (isPrimitiveValue(propInSource)) {
      (target as any)[sourceProperties[i].key] = propInSource
    }
    else if (typeof propInSource === 'object') {
      if (Array.isArray(propInSource)) {
        const arrayInTarget: unknown[] = (target as any)[sourceProperties[i].key] ?? []

        propInSource.forEach(v => {
          const found: AbstractModel | undefined = arrayInTarget.find((e: AbstractModel) => e.id == v.id)

          if (found) {
            merge(v, found)
          } else {

          }
        })
      } else {
        if (typeof (target as any)[sourceProperties[i].key] === 'undefined') {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (target as any)[sourceProperties[i].key] = new sourceProperties[i].type();
          (target as any)[sourceProperties[i].key].id = (propInSource as any).id
        }
        merge((source as any)[sourceProperties[i].key], (target as any)[sourceProperties[i].key])
      }
    } else {
      // type of property is function and is ignored
    }
  }

  return target
}

class Talent extends AbstractModel {

  constructor(id: ModelId, name: string) {
    super( id );
    this.name = name
  }

  name: string
}

export class TalentView extends AbstractModel {
  constructor(id: ModelId, name: string) {
    super( id );
    this.name = name
  }

  @prop
  name: string
}

class LocationView extends AbstractModel {

  constructor(id: ModelId, street: string) {
    super( id );
    this.street = street;
  }

  @prop
  street: string
}

class Location extends AbstractModel {


  constructor(id: ModelId, street: string, city: string) {
    super( id );
    this.street = street;
    this.city = city;
  }

  @prop
  street: string

  @prop
  city: string
}

class User extends AbstractModel {

  constructor(id: ModelId) {
    super( id );
  }
  name: string

  password: string

  @prop
  location: Location

  @arrayProp(Talent)
  talents: Talent[]
}

class UserView extends AbstractModel {

  constructor(id: ModelId) {
    super( id );
  }

  @prop
  name: string

  @prop
  location: LocationView

  @prop
  talents: Talent[]
}

const existingUser: User = new User(1)
existingUser.password = 's3cr3t'
existingUser.name = 'matthi'
existingUser.lastModifiedAt = 34324234324
// existingUser.location = new Location(23, 'Bres', 'Wue')
existingUser.talents = [new Talent(1337, "should be removed"), new Talent(2, 'should be removed')]


const incomingUserView: UserView = new UserView(1423324)
incomingUserView.name = 'sophia'
incomingUserView.location = new LocationView(23, 'Bres')
incomingUserView.talents = []
incomingUserView.talents.push(new Talent(1337, 'Coding'), new Talent(458645, 'should be there'))

console.log(merge2punkt0(incomingUserView, existingUser))


console.log('#####################')

// console.log(merge(existingUser, incomingUserView))

 */

export class LocationModel extends AbstractModel {

  constructor(id: ModelId) {
    super( id );
  }

  @prop
  name: string

  @prop
  street: string
}

export class LocationView extends AbstractModel{

  constructor(id: ModelId) {
    super( id );
  }

  @prop
  name: string
}

export class AddressModel extends AbstractModel {

  constructor(id: ModelId, name: string, city: string) {
    super( id );
    this.name = name;
    this.city = city;
  }

  @prop
  name: string

  @prop
  city: string
}

export class AddressView extends AbstractModel {

  constructor(id: ModelId, name: string) {
    super( id );
    this.name = name;
  }

  @prop
  name: string
}

export class UserView extends AbstractModel {

  constructor(id: ModelId) {
    super( id );
  }

  @prop
  name: string

  @prop
  location: LocationView

  @arrayProp(AddressView)
  address: AddressView[]
}

export class UserModel extends AbstractModel {

  constructor(id: ModelId) {
    super( id );
  }

  @prop
  name: string

  @prop
  password: string

  @prop
  location: LocationModel

  @arrayProp(AddressModel)
  address: AddressModel[]
}

const addressModelList: AddressModel[] = []

const addressModel: AddressModel = new AddressModel(4711, 'Headquarters', 'London')
addressModelList.push(addressModel)

const addressModelToBeDeleted: AddressModel = new AddressModel(4712, 'Headquarters', 'London')
addressModelList.push(addressModelToBeDeleted)

const existingUserModel: UserModel = new UserModel(1)
existingUserModel.name = 'Bond'
existingUserModel.password = 'secret'
existingUserModel.address = addressModelList

const addressViewList: AddressView[] = []

const addressView: AddressView = new AddressView(4711, 'New Headquarters')
addressViewList.push(addressView)

const newAddressView: AddressView = new AddressView(2, "Moneypenny's place")
newAddressView.id = undefined
addressViewList.push(newAddressView)

const incomingLocationView: LocationView = new LocationView(2)
incomingLocationView.name = 'Sussex'

const incomingUserView: UserView = new UserView(1)
incomingUserView.name = 'Bond'
incomingUserView.location = incomingLocationView
incomingUserView.address = addressViewList

console.log(existingUserModel)

merge2punkt0(incomingUserView, existingUserModel)
const result: UserModel = existingUserModel

console.log(1 === result.id)
console.log('Bond' === result.name)
console.log('secret' === result.password)
console.log(typeof result.address !== "undefined")
console.log(2 === result.address.length)
console.log('New Headquarters' === result.address[0].name)
console.log('London' === result.address[0].city)
console.log("Moneypenny's place" === result.address[1].name)

console.log(incomingUserView)
console.log(result)
