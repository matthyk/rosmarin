import {
  AbstractViewModel,
  collectionView,
  view,
  viewArrayProp,
  viewProp,
} from '../../../src'
import { buildValidationSchema } from '../../../src/json-schema-builder'

describe('validation schema builder', () => {
  describe('buildValidationSchema', () => {
    it('should set id from AbstractViewModel as non required property', () => {
      class View extends AbstractViewModel {}

      const schema = buildValidationSchema(View)

      expect(schema).toBeDefined()
      expect(schema.type).toEqual('object')
      expect(schema.required).toHaveLength(0)
      expect(schema.properties.id).toBeDefined()
      expect(schema.properties.id).toEqual({
        anyOf: [{ type: 'string' }, { type: 'integer' }],
      })
    })

    it('should build schema for View class with primitive properties only', () => {
      class View extends AbstractViewModel {
        @viewProp()
        name: string

        @viewProp()
        password: string
      }

      const schema = buildValidationSchema(View)

      expect(schema).toBeDefined()
      expect(schema.type).toEqual('object')
      expect(schema.required).toHaveLength(2)
      expect(schema.required).toEqual(['name', 'password'])
      expect(schema.properties.name).toEqual({
        type: 'string',
      })
      expect(schema.properties.password).toEqual({
        type: 'string',
      })
    })

    it('should use user provided JSON Schema for view property', () => {
      class View extends AbstractViewModel {
        @viewProp({ type: 'number', multipleOf: 1.0 })
        wow: string
      }

      const schema = buildValidationSchema(View)

      expect(schema).toBeDefined()
      expect(schema.type).toEqual('object')
      expect(schema.required).toHaveLength(1)
      expect(schema.properties.wow).toBeDefined()
      expect(schema.properties.wow).toEqual({
        type: 'number',
        multipleOf: 1.0,
      })
    })

    it('should use user provided JSON Schema for view', () => {
      @view({ required: ['id', 'wow'] })
      class View extends AbstractViewModel {
        @viewProp()
        wow: string
      }

      const schema = buildValidationSchema(View)

      expect(schema).toBeDefined()
      expect(schema.type).toEqual('object')
      expect(schema.required).toHaveLength(2)
      expect(schema.required).toEqual(['id', 'wow'])
      expect(schema.properties.wow).toBeDefined()
      expect(schema.properties.wow).toEqual({
        type: 'string',
      })
      expect(schema.additionalProperties).toBeDefined()
      expect(schema.additionalProperties).toBeFalsy()
    })

    it('should create array JSON Schema for collection views', () => {
      @collectionView()
      class CollectionView extends AbstractViewModel {
        @viewProp()
        prop1: string

        @viewProp()
        prop2: boolean
      }

      const schema = buildValidationSchema(CollectionView)

      expect(schema).toBeDefined()
      expect(schema.type).toEqual('array')
      expect(schema.items).toBeDefined()
      expect(schema.items).toEqual({
        type: 'object',
        properties: {
          prop1: {
            type: 'string',
          },
          prop2: {
            type: 'boolean',
          },
          id: {
            anyOf: [{ type: 'string' }, { type: 'integer' }],
          },
        },
        additionalProperties: false,
        required: ['prop1', 'prop2'],
      })
    })

    it('should support nested views', () => {
      class NestedView extends AbstractViewModel {
        @viewProp()
        test: string
      }

      class View extends AbstractViewModel {
        @viewProp({ type: 'string', maxLength: 15, minLength: 10 })
        s: string

        @viewProp()
        nested: NestedView
      }

      const schema = buildValidationSchema(View)

      expect(schema).toBeDefined()
      expect(schema.type).toEqual('object')
      expect(schema.required).toHaveLength(2)
      expect(schema.required).toEqual(['s', 'nested'])
      expect(schema.properties.nested).toBeDefined()
      expect(schema.properties.nested).toEqual({
        type: 'object',
        properties: {
          test: {
            type: 'string',
          },
          id: {
            anyOf: [{ type: 'string' }, { type: 'integer' }],
          },
        },
        required: ['test'],
        additionalProperties: false,
      })
      expect(schema.properties.s).toEqual({
        type: 'string',
        maxLength: 15,
        minLength: 10,
      })
    })

    it('should support nested array views', () => {
      class NestedView extends AbstractViewModel {
        @viewProp()
        myProperty: string
      }

      class View extends AbstractViewModel {
        @viewProp({}, () => Boolean)
        s: string

        @viewArrayProp(() => NestedView)
        collection: NestedView[]
      }

      const schema = buildValidationSchema(View)

      expect(schema).toBeDefined()
      expect(schema.type).toEqual('object')
      expect(schema.required).toHaveLength(2)
      expect(schema.required).toEqual(['s', 'collection'])
      expect(schema.properties.collection).toBeDefined()
      expect(schema.properties.collection).toEqual({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            myProperty: {
              type: 'string',
            },
            id: {
              anyOf: [{ type: 'string' }, { type: 'integer' }],
            },
          },
          required: ['myProperty'],
          additionalProperties: false,
        },
      })
      expect(schema.properties.s).toEqual({
        type: 'boolean',
      })
    })
  })
})
