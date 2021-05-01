import {
  AbstractDeleteState,
  NoContentDatabaseResult,
  SingleModelDatabaseResult,
  State,
} from '../../../../src'
import { User } from '../user.model'
import { UserRepository } from '../user.repository'

@State()
export class DeleteUser extends AbstractDeleteState<User> {
  constructor(private readonly userRepository?: UserRepository) {
    super()
  }

  protected defineTransitionLinks(): Promise<void> | void {
    this.addLink('/users', 'getAllUsers', 'application/vnd.user+json')
  }

  protected deleteModelInDatabase(): Promise<NoContentDatabaseResult> {
    return this.userRepository.deleteById(this.modelIdToDelete)
  }

  protected loadModelFromDatabase(): Promise<SingleModelDatabaseResult<User>> {
    return this.userRepository.readById(this.modelIdToDelete)
  }
}
