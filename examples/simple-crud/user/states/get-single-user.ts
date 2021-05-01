import {
  AbstractGetState,
  CacheControlConfiguration,
  CachingType,
  SingleModelDatabaseResult,
  State,
} from '../../../../src'
import { User } from '../user.model'
import { UserRepository } from '../user.repository'

@State()
export class GetSingleUser extends AbstractGetState<User> {
  constructor(private readonly userRepository?: UserRepository) {
    super()
  }

  protected defineTransitionLinks(): Promise<void> | void {
    this.addLink('/users', 'getAllUsers', 'application/vnd.user+json')
    this.addLink('/users/{}', 'deleteUser', [this.requestedId])
    this.addLink('/users/{}', 'updateUser', 'application/vnd.user+json', [
      this.requestedId,
    ])
  }

  protected loadModelFromDatabase(): Promise<SingleModelDatabaseResult<User>> {
    return this.userRepository.readById(this.requestedId)
  }

  protected configureState(): void {
    this.setHttpCachingType(
      CachingType.VALIDATION_ETAG,
      CacheControlConfiguration.PUBLIC
    )
    this.maxAgeInSeconds = 86400 // 1 day
  }
}
