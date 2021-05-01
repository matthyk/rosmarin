import {
  AbstractViewModel,
  buildValidatorAndTransformer,
  viewProp,
} from '../../../../src'

export class CreateUserView extends AbstractViewModel {
  @viewProp({
    type: 'string',
    minLength: 5,
    maxLength: 20,
  })
  name: string

  @viewProp({
    type: 'string',
    minLength: 10,
    maxLength: 20,
  })
  password: string

  @viewProp({
    type: 'integer',
    minimum: 1,
  })
  age: number
}

export const createUserViewSchema = buildValidatorAndTransformer(CreateUserView)
