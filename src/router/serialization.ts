import { IError } from '../models/error-model'
import fastJson from 'fast-json-stringify'
import { Constructor } from '../utility-types'
import { buildSerializationSchema } from '../json-schema-builder/serialization-schema-builder'
import { AbstractModel } from '../models'
import { AbstractViewModel } from '../models'
import { ViewConverter } from './route-definitions'

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

export const buildViewConverter = <
  T extends AbstractModel,
  V extends AbstractViewModel
>(
  from: Constructor<T>,
  to: Constructor<V>
): ViewConverter | undefined => {
  if (typeof from === 'undefined' || typeof to === 'undefined') return undefined

  return fastJson(buildSerializationSchema(from, to))
}
