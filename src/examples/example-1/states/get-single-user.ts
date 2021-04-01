import { AbstractGetState } from '../../../api/states/get/abstract-get-state'
import { UserModel } from '../models/user-model'
import { SingleModelDatabaseResult } from '../../../database/results/single-model-database-result'
import { UserRepository } from '../repositories/user-repository'
import { State } from '../../../api/states/decorator'
import { CachingType } from '../../../api/caching/caching-type'
import { CacheControlConfiguration } from '../../../api/caching/cache-control-configuration'

@State()
export class GetSingleUser extends AbstractGetState<UserModel> {
  constructor(private readonly userRepository?: UserRepository) {
    super()
  }

  protected defineTransitionLinks(): Promise<void> | void {
    this.addLink('/users', 'getAllUsers', 'application/vnd.user+json')
    this.addLink('/users/{}', 'updateUser', 'application/vnd.user+json', [
      this.requestedModel.result.id,
    ])
    this.addLink('/users/{}', 'deleteUser', [this.requestedModel.result.id])
  }

  protected loadModelFromDatabase(): Promise<
    SingleModelDatabaseResult<UserModel>
  > {
    return this.userRepository.readById(this.requestedId)
  }

  protected configureState(): void {
    this.setHttpCachingType(
      CachingType.VALIDATION_ETAG,
      CacheControlConfiguration.PRIVATE
    )
    this.maxAgeInSeconds = 3600
  }
}
