import { AbstractGetCollectionState } from '../../../api/states/get/abstract-get-collection-state'
import { UserModel } from '../models/user-model'
import { CollectionModelDatabaseResult } from '../../../database/results/collection-model-database-result'
import { injectable } from 'tsyringe'
import { AbstractFilter } from '../../../api/filter/abstract-filter'
import { StateContext } from '../../../api/state-context'
import { page } from '../../../api/states/pager'
import { UserRepository } from '../repositories/user-repository'
import { PagingBehaviourUsingOffsetSize } from '../../../api/filter/paging-behaviour-using-offset-size'
import { State } from '../../../api/states/decorator'

@injectable()
class GetAllUserQuery extends AbstractFilter<UserModel> {
  constructor(private readonly userRepo: UserRepository) {
    super()
  }

  protected async executeDatabaseQuery(
    context: StateContext
  ): Promise<CollectionModelDatabaseResult<UserModel>> {
    const allUsers = await this.userRepo.readAll()

    const result = new CollectionModelDatabaseResult<UserModel>(
      page<UserModel>(
        allUsers.databaseResult,
        context.get<number>('offset'),
        context.get<number>('size')
      )
    )
    result.totalNumberOfResult = allUsers.databaseResult.length

    return result
  }
}

@State()
export class GetAllUsers extends AbstractGetCollectionState<UserModel> {
  constructor(private readonly userQuery: GetAllUserQuery) {
    super()
  }

  protected loadModelsFromDatabase(): Promise<
    CollectionModelDatabaseResult<UserModel>
  > {
    return this.userQuery.startDatabaseQuery(this.stateContext)
  }

  protected defineTransitionLinks(): Promise<void> | void {
    return undefined
  }

  protected configureState(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.stateContext.put('offset', +this._req.query.offset)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.stateContext.put('size', +this._req.query.size)

    this.userQuery.pagingBehaviour = new PagingBehaviourUsingOffsetSize(
      this.stateContext.get('offset'),
      this.stateContext.get('size')
    )
    this.query = this.userQuery
  }
}
