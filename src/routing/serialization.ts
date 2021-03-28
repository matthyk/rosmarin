import { IError } from '../error-interface'
import fastJson, { Schema } from 'fast-json-stringify'
import { StringifyFn } from './utility-types'

const sharedSchemas: Record<string, Schema> = {
  id: {
    // @ts-ignore
    $id: 'id',
    anyOf: [{ type: 'string' }, { type: 'integer' }],
  },
  link: {
    // @ts-ignore
    $id: 'link',
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
  },
}

const serializeErrorFn = fastJson({
  type: 'object',
  properties: {
    status: {
      type: 'integer',
      minimum: 400,
      exclusiveMaximum: 600,
    },
    message: {
      type: 'string',
    },
    error: {
      type: 'string',
    },
    code: {
      anyOf: [{ type: 'string' }, { type: 'integer' }],
    },
  },
  required: ['status', 'message', 'error'],
  additionalProperties: false,
})

export const serializeErrorResponse = (error: IError): string =>
  serializeErrorFn(error)

export const createSerializationFn = (
  schema?: Schema
): StringifyFn | undefined => {
  if (typeof schema === 'undefined') return undefined
  return fastJson(schema, { schema: sharedSchemas })
}
