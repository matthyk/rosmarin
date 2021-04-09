import { SingleModelDatabaseResult } from '../results'
import { AbstractUserModel } from '../../models/abstract-user-model'
import { ModelId } from '../../models'

export interface IUserRepository {
  readUserByPrincipal(
    principal: string
  ): Promise<SingleModelDatabaseResult<AbstractUserModel>>

  readUserById(
    id: ModelId
  ): Promise<SingleModelDatabaseResult<AbstractUserModel>>
}
