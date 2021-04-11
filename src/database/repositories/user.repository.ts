import { SingleModelDatabaseResult } from '../results'
import { AbstractUserModel } from '../../models/abstract-user-model'
import { ModelId } from '../../models'

export interface IUserRepository {
  readByPrincipal(
    principal: string
  ): Promise<SingleModelDatabaseResult<AbstractUserModel>>

  readById(id: ModelId): Promise<SingleModelDatabaseResult<AbstractUserModel>>
}
