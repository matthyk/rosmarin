import { AbstractPostState } from '../../../api/states/post/abstract-post-state'
import { UserModel } from '../models/user-model'
import { CreateUserView } from '../views/create-user-view'
import { NoContentDatabaseResult } from '../../../database/results/no-content-database-result'
import { UserRepository } from '../repositories/user-repository'
import { State } from '../../../api/states/decorator'

@State()
export class PostUser extends AbstractPostState<UserModel, CreateUserView> {
  constructor(private readonly userRepository: UserRepository) {
    super()
  }

  protected createDatabaseModel(): UserModel {
    return new UserModel(undefined)
  }

  protected createModelInDatabase(): Promise<NoContentDatabaseResult> {
    return this.userRepository.create(this.modelToStoreInDatabase)
  }

  protected defineTransitionLinks(): Promise<void> | void {
    this.addLink('/users', 'getAllUsers', 'application/vnd.user+json')
  }
}
