import { IError } from '../error-interface'
import fastJson from 'fast-json-stringify'

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
