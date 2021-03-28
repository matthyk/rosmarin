import { FastifyRequest } from 'fastify'
import { Schemas } from './route-definition'
import Ajv, { ValidateFunction } from 'ajv'
import { RoutingError } from './routing-error'

const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
  nullable: true,
})

export default ajv

export const compileValidationSchema = (
  schema?: Record<string, unknown>
): ValidateFunction | undefined => {
  return schema ? ajv.compile(schema) : undefined
}

export const validateRequest = (
  req: FastifyRequest,
  validationFns: Schemas<ValidateFunction>
): void => {
  // TODO: create user friendly error messages

  if (validationFns.body) {
    const valid = validationFns.body(req.body)
    if (!valid)
      throw new RoutingError(
        422,
        'Unprocessable Entity',
        'Validation of request body failed.'
      ) //TODO: 400 or 422?
  }

  if (validationFns.query) {
    const valid = validationFns.query(req.query)
    if (!valid)
      throw new RoutingError(
        422,
        'Unprocessable Entity',
        'Validation of request query parameters failed.'
      )
  }

  if (validationFns.params) {
    const valid = validationFns.params(req.params)
    if (!valid)
      throw new RoutingError(
        422,
        'Unprocessable Entity',
        'Validation of request path parameters failed.'
      )
  }

  if (validationFns.headers) {
    const valid = validationFns.headers(req.headers)
    if (!valid)
      throw new RoutingError(
        422,
        'Unprocessable Entity',
        'Validation of request headers failed.'
      )
  }
}
