import {
  AbstractPutState,
  NoContentDatabaseResult,
  SingleModelDatabaseResult,
  State,
} from '../../../../src'
import { UpdateUserView } from '../views/update-user-view'
import { User } from '../user.model'
import { UserRepository } from '../user.repository'

@State()
export class PutUser extends AbstractPutState<User, UpdateUserView> {
  constructor(private readonly userRepository?: UserRepository) {
    super()
  }

  protected defineTransitionLinks(): Promise<void> | void {
    this.addLink('/users/{}', 'self', 'application/vnd.user+json', [
      this.updatedId,
    ])
  }

  protected loadModelFromDatabase(): Promise<SingleModelDatabaseResult<User>> {
    return this.userRepository.readById(this.updatedId)
  }

  protected updateModelInDatabase(): Promise<NoContentDatabaseResult> {
    return this.userRepository.update(this.modelInDatabase)
  }
}
