import { AbstractDeleteState } from '../../../api/states/delete/abstract-delete-state'
import { UserModel } from '../models/user-model'
import { SingleModelDatabaseResult } from '../../../database/results/single-model-database-result'
import { NoContentDatabaseResult } from '../../../database/results/no-content-database-result'
import { UserRepository } from '../repositories/user-repository'
import { State } from '../../../api/states/decorator'

@State()
export class DeleteUser extends AbstractDeleteState<UserModel> {
  constructor(private readonly userRepo?: UserRepository) {
    super()
  }

  protected defineTransitionLinks(): Promise<void> | void {
    return undefined
  }

  protected deleteModelInDatabase(): Promise<NoContentDatabaseResult> {
    return this.userRepo.deleteById(this.modelIdToDelete)
  }

  protected loadModelFromDatabase(): Promise<
    SingleModelDatabaseResult<UserModel>
  > {
    return this.userRepo.readById(this.modelIdToDelete)
  }

  protected configureState(): void {
    this.modelIdToDelete = (this.req as any).params.id
  }
}
