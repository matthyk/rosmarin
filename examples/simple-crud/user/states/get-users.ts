import {
  AbstractGetCollectionStateWithOffsetSizePaging,
  CollectionModelDatabaseResult,
  State,
} from '../../../../src'
import { User } from '../user.model'
import { UserRepository } from '../user.repository'

@State()
export class GetUsers extends AbstractGetCollectionStateWithOffsetSizePaging<User> {
  constructor(private readonly userRepository?: UserRepository) {
    super()
  }

  protected defineTransitionLinks(): Promise<void> | void {
    this.addLink('/users', 'createNewUser', 'application/vnd.user+json')
  }

  protected loadModelsFromDatabase(): Promise<
    CollectionModelDatabaseResult<User>
  > {
    return this.userRepository.readAll(this.offset, this.size)
  }
}
