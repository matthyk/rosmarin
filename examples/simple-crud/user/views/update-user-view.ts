import {
  buildValidatorAndTransformer,
  viewProp,
  AbstractViewModel,
} from '../../../../src'

export class UpdateUserView extends AbstractViewModel {
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
    required: false,
  })
  age: number
}

export const updateUserViewSchema = buildValidatorAndTransformer(UpdateUserView)
