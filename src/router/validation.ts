import { ValidatorAndTransformer } from './route-definitions'
import Ajv from 'ajv'
import { RouterError } from './router-error'
import { Constructor } from './utility-types'
import { plainToClass } from 'class-transformer'
import { buildSchema } from '../json-schema-builder'
import { FastifyRequest } from 'fastify'

const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
  nullable: true,
})

export const validateAndTransform = (
  req: FastifyRequest,
  toValidate: 'body' | 'params' | 'query',
  validatorAndTransformer: ValidatorAndTransformer
): void => {
  if (
    typeof toValidate === 'undefined' ||
    typeof validatorAndTransformer?.validationFn !== 'function'
  )
    return

  const isValid:
    | boolean
    | PromiseLike<unknown> = validatorAndTransformer.validationFn(
    req[toValidate]
  )

  if (!isValid)
    throw new RouterError(
      422,
      'Unprocessable Entity',
      `Validation of the request ${toValidate} failed.`
    )

  req[toValidate] = validatorAndTransformer.transformer(req[toValidate])
}

export const buildValidatorAndTransformerFn = <T>(
  ctor: Constructor<T>
): ValidatorAndTransformer | undefined => {
  if (typeof ctor === 'undefined') return undefined

  const schema = buildSchema(ctor)

  return {
    validationFn: ajv.compile(schema),
    transformer: (plain: unknown): T => plainToClass(ctor, plain), // TODO: replace class-transformer
  }
}

export default ajv
