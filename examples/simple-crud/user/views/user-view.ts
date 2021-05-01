import {
  AbstractViewModel,
  buildViewConverter,
  viewProp,
} from '../../../../src'
import { User } from '../user.model'

export class UserView extends AbstractViewModel {
  @viewProp()
  name: string

  @viewProp({
    type: 'integer',
    minimum: 1,
    required: false,
  })
  age: number
}

export const userViewConverter = buildViewConverter(User, UserView)
