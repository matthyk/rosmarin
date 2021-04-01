import { PoolClient, QueryResult } from 'pg'
import { DatabaseError } from '../../database-error'
import { Logger } from 'pino'

export class PostgresClient {
  constructor(
    private readonly poolClient: PoolClient,
    private readonly logger: Logger
  ) {}

  public async begin(): Promise<void> {
    this.logger.debug('Start Transaction.')

    try {
      await this.poolClient.query('BEGIN')
    } catch (e) {
      this.logger.error(
        'Cannot BEGIN transaction. Release Pool Client. ' + e.message
      )

      this.releasePoolClient()

      throw new DatabaseError()
    }
  }

  public async query<T>(
    query: string,
    ...params: unknown[]
  ): Promise<QueryResult<T>> {
    try {
      return this.poolClient.query(query, params)
    } catch (e) {
      this.logger.error('Cannot QUERY Pool Client. ' + e.message)

      await this.abortAndRollback()

      throw new DatabaseError()
    }
  }

  public async end(): Promise<void> {
    this.logger.debug('End Transaction.')

    try {
      await this.poolClient.query('COMMIT')
    } catch (e) {
      this.logger.error(
        'Cannot COMMIT transaction. Try to ROLLBACK all changes. ' + e.message
      )

      await this.abortAndRollback()

      throw new DatabaseError()
    } finally {
      this.releasePoolClient()
    }
  }

  private async abortAndRollback(): Promise<void> {
    this.logger.debug('Abort Transaction and rollback client.')
    try {
      await this.poolClient.query('ROLLBACK')
    } catch (e) {
      this.logger.error(
        'ROLLBACK failed. Release Pool Client without rolling back changes. ' +
          e.message
      )
    } finally {
      this.releasePoolClient()
    }
  }

  private releasePoolClient(): void {
    this.logger.debug('RELEASE Pool Client.')
    try {
      this.poolClient.release()
    } catch (e) {
      this.logger.error('Releasing Pool Client failed. ' + e.message)
    }
  }
}
