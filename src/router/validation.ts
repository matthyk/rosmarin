import {
  JsonSchema,
  JsonSchemaAndTransformer,
  ValidatorAndTransformer,
} from './route-definitions'
import Ajv, { ValidateFunction } from 'ajv'
import { RouterError } from './errors/router-error'
import { Constructor } from '../utility-types'
import { plainToClass } from 'class-transformer'
import { buildValidationSchema } from '../json-schema-builder'
import { FastifyRequest } from 'fastify'
import { AbstractViewModel } from '../models/abstract-view-model'

const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
  nullable: true,
})

export const validate = (
  req: FastifyRequest,
  toValidate: 'body' | 'params' | 'query',
  validationFn: ValidateFunction
): void => {
  if (typeof validationFn === 'undefined') return

  const isValid: boolean | PromiseLike<unknown> = validationFn(req[toValidate])

  if (!isValid)
    throw new RouterError(
      422,
      'Unprocessable Entity',
      `Validation of the request ${toValidate} failed.`
    )
}

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

  req[toValidate] = validatorAndTransformer.transformationFn(req[toValidate])
}

export const buildValidatorAndTransformer = <T extends AbstractViewModel>(
  ctor: Constructor<T>
): JsonSchemaAndTransformer | undefined => {
  if (typeof ctor === 'undefined') return undefined

  const schema = buildValidationSchema(ctor)

  return {
    schema,
    transformer: (plain: unknown): T => plainToClass(ctor, plain), // TODO: replace class-transformer
  }
}

export const compileSchema = (
  schema?: JsonSchema
): ValidateFunction | undefined =>
  typeof schema === 'undefined' ? undefined : ajv.compile(schema)

export default ajv
