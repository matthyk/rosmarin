import {
  AbstractPostState,
  NoContentDatabaseResult,
  State,
} from '../../../../src'
import { CreateUserView } from '../views/create-user-view'
import { User } from '../user.model'
import { UserRepository } from '../user.repository'

@State()
export class PostUser extends AbstractPostState<User, CreateUserView> {
  constructor(private readonly userRepository?: UserRepository) {
    super()
  }

  protected createDatabaseModel(): User {
    return new User()
  }

  protected createModelInDatabase(): Promise<NoContentDatabaseResult> {
    return this.userRepository.create(this.modelToStoreInDatabase)
  }

  protected defineTransitionLinks(): Promise<void> | void {}
}
