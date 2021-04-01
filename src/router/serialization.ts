import { IError } from '../error-interface'
import fastJson from 'fast-json-stringify'
import { Constructor, StringifyFn } from './utility-types'
import { buildSchema } from '../json-schema-builder'

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

export const buildSerializationFn = (
  ctor: Constructor
): StringifyFn | undefined => {
  if (typeof ctor === 'undefined')
    return undefined

  return fastJson(buildSchema(ctor))
}
