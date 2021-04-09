import {
  AbstractModel,
  AbstractViewModel,
  link,
  Link,
  modelArrayProp,
  modelProp,
  viewArrayProp,
  viewProp,
} from '../../../src'
import { buildSerializationSchema } from '../../../src/json-schema-builder/serialization-schema-builder'

describe('serialization schema builder', () => {
  describe('buildSerializationSchema', () => {
    it('should include links from model', () => {
      class Model extends AbstractModel {
        @link('/models/{id}', 'self', 'text/html')
        self: Link
        @link('/models/{id}/fruits', 'fruits', 'text/plain')
        fruits: Link
      }

      class View extends AbstractViewModel {}

      const schema = buildSerializationSchema(Model, View)

      expect(schema).toBeDefined()
      expect(schema.type).toEqual('object')
      expect(schema.required).toHaveLength(2)
      expect(schema.properties.self).toBeDefined()
      expect(schema.properties.self).toEqual({
        type: 'object',
        properties: {
          href: {
            type: 'string',
          },
          rel: {
            type: 'string',
          },
          type: {
            type: 'string',
          },
        },
        required: ['href', 'rel'],
        additionalProperties: false,
      })
      expect(schema.properties.fruits).toBeDefined()
      expect(schema.properties.fruits).toEqual({
        type: 'object',
        properties: {
          href: {
            type: 'string',
          },
          rel: {
            type: 'string',
          },
          type: {
            type: 'string',
          },
        },
        required: ['href', 'rel'],
        additionalProperties: false,
      })
    })

    it('should include links from embedded resource', () => {
      class NestedModel extends AbstractModel {
        @link('/models/{id}', 'self', 'text/html')
        self: Link
      }

      class Model extends AbstractModel {
        @modelProp()
        nested: NestedModel
      }

      class NestedView extends AbstractViewModel {}

      class View extends AbstractViewModel {
        @viewProp()
        nested: NestedView
      }

      const schema = buildSerializationSchema(Model, View)

      expect(schema).toBeDefined()
      expect(schema.type).toEqual('object')
      expect(schema.required).toHaveLength(1)
      expect(schema.properties.nested).toBeDefined()
      expect(schema.properties.nested).toEqual({
        type: 'object',
        properties: {
          self: {
            type: 'object',
            properties: {
              href: {
                type: 'string',
              },
              rel: {
                type: 'string',
              },
              type: {
                type: 'string',
              },
            },
            required: ['href', 'rel'],
            additionalProperties: false,
          },
          id: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'integer',
              },
            ],
          },
        },
        required: ['self'],
        additionalProperties: false,
      })
    })

    it('should include links from embedded collection resource', () => {
      class NestedModel extends AbstractModel {
        @link('/models/{id}', 'self', 'text/html')
        link: Link
      }

      class Model extends AbstractModel {
        @modelArrayProp(() => NestedModel)
        nested: NestedModel[]
      }

      class NestedView extends AbstractViewModel {}

      class View extends AbstractViewModel {
        @viewArrayProp(() => NestedView)
        nested: NestedView[]
      }

      const schema = buildSerializationSchema(Model, View)

      expect(schema).toBeDefined()
      expect(schema.type).toEqual('object')
      expect(schema.required).toHaveLength(1)
      expect(schema.properties.nested).toBeDefined()
      expect(schema.properties.nested).toEqual({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            link: {
              type: 'object',
              properties: {
                href: {
                  type: 'string',
                },
                rel: {
                  type: 'string',
                },
                type: {
                  type: 'string',
                },
              },
              required: ['href', 'rel'],
              additionalProperties: false,
            },
            id: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'integer',
                },
              ],
            },
          },
          required: ['link'],
          additionalProperties: false,
        },
      })
    })

    it('should include links from embedded resource with embedded collection resource', () => {
      class NestedModel extends AbstractModel {
        @modelArrayProp(() => String)
        strings: string[]
      }

      class Model extends AbstractModel {
        @modelProp()
        nested: NestedModel
      }

      class NestedView extends AbstractViewModel {
        @viewArrayProp(() => String)
        strings: string[]
      }

      class View extends AbstractViewModel {
        @viewProp()
        nested: NestedView
      }

      const schema = buildSerializationSchema(Model, View)

      expect(schema).toBeDefined()
      expect(schema.type).toEqual('object')
      expect(schema.required).toHaveLength(1)
      expect(schema.properties.nested).toBeDefined()
      expect(schema.properties.nested).toEqual({
        type: 'object',
        properties: {
          strings: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          id: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'integer',
              },
            ],
          },
        },
        required: ['strings'],
        additionalProperties: false,
      })
    })
  })
})
