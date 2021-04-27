import { AbstractPropertyStore } from '../../../src/metadata-stores/abstract-property-store'
import { AbstractModel } from '../../../src'
import { Property } from '../../../src/metadata-stores'
import { Target, Constructor } from '../../../src/types'

describe('AbstractPropertyStore', () => {
  const randomDecorator = (
    _target: Target,
    _propertyKey: string | symbol
  ): void => {}

  const compareFn = (a: Property, b: Property): number =>
    a.name.localeCompare(b.name)

  class Store extends AbstractPropertyStore<AbstractModel, Property> {}

  let store: Store

  beforeEach(() => {
    store = new Store()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    store.addProperty(AbstractModel, { name: 'id', type: Object })
    store.addProperty(Model, { name: 'name', type: String })
  })

  class Model extends AbstractModel {
    name: string
    @randomDecorator
    password: number
    stringPassword: string
  }

  class SecondModel extends Model {
    second: number
  }

  describe('addProperty', () => {
    it('should store property', () => {
      expect(store['properties'].get(Model)).toContainEqual({
        name: 'name',
        type: String,
      })
    })

    it('should not add property from superclass twice', () => {
      store.addProperty(Model, { name: 'wow', type: Boolean })

      expect(store['properties'].get(Model)).toHaveLength(3)
    })

    it('should use property definition from sub-class', () => {
      store.addProperty(Model, { name: 'id', type: Number })

      expect(store['properties'].get(Model)).toHaveLength(2)
      expect(store['properties'].get(Model)).toContainEqual({
        name: 'id',
        type: Number,
      })
    })

    it('should search in super classes with every call', () => {
      store.addProperty(Model, { name: 'wow', type: Boolean })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      store.addProperty(AbstractModel, { name: 'newProperty', type: Number })
      store.addProperty(Model, { name: 'test', type: String })

      expect(store['properties'].get(Model)).toHaveLength(5)
    })

    it('should always override property definition', () => {
      store.addProperty(Model, { name: 'prop', type: Number })
      store.addProperty(Model, { name: 'prop', type: String })

      expect(store['properties'].get(Model)).toContainEqual({
        name: 'prop',
        type: String,
      })

      store.addProperty(Model, { name: 'prop', type: Boolean })

      expect(store['properties'].get(Model)).toHaveLength(3)
      expect(store['properties'].get(Model)).toContainEqual({
        name: 'prop',
        type: Boolean,
      })
    })
  })

  describe('getProperties', () => {
    it('should return properties including id from AbstractModel', () => {
      const expected = [
        { name: 'name', type: String },
        { name: 'id', type: Object },
      ].sort(compareFn)

      expect(store.getProperties(Model).sort(compareFn)).toEqual(expected)
    })

    it('should return properties including all properties from all super classes', () => {
      store.addProperty(SecondModel, { name: 'second', type: Number })

      const expected = [
        { name: 'name', type: String },
        { name: 'id', type: Object },
        { name: 'second', type: Number },
      ].sort(compareFn)

      expect(store.getProperties(SecondModel).sort(compareFn)).toEqual(expected)
    })
  })

  describe('getPropertyType', () => {
    it('should return correct type of property if the property is registered', () => {
      expect(store.getPropertyType(Model, 'name')).toEqual(String)
    })

    it('should return undefined if the property is not registered and not annotated with any decorator', () => {
      expect(store.getPropertyType(Model, 'stringPassword')).toBeUndefined()
    })

    it('should return reflected type if the property is not registered but annotated with any decorator', () => {
      expect(store.getPropertyType(Model, 'password')).toEqual(Number)
    })

    it('should prefer registered type to reflected type', () => {
      store.addProperty(Model, { name: 'password', type: String })

      expect(store.getPropertyType(Model, 'password')).toEqual(String)
    })

    it('should prefer typeFn over type', () => {
      store.addProperty(Model, {
        name: 'test',
        type: String,
        typeFn: () => Number,
      })

      expect(store.getPropertyType(Model, 'test')).toEqual(Number)
    })

    it('should work with property from superclass', () => {
      expect(store.getPropertyType(SecondModel, 'name')).toEqual(String)
    })
  })

  describe('getArrayProperties', () => {
    it('should return empty array if there are none', () => {
      expect(store.getArrayProperties(Model)).toEqual([])
    })

    it('should return all array properties', () => {
      store.addProperty(Model, {
        name: 'array',
        type: [].constructor as Constructor,
      })

      expect(store.getArrayProperties(Model)).toHaveLength(1)
      expect(store.getArrayProperties(Model)[0]).toEqual({
        name: 'array',
        type: [].constructor as Constructor,
      })
    })
  })
})
