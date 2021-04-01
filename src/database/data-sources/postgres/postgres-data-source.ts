import { Pool, PoolClient, QueryResult } from 'pg'
import { container, singleton } from 'tsyringe'
import { Logger } from 'pino'
import { DatabaseError } from '../../database-error'
import { PostgresClient } from './postgres-client'
import constants from '../../../constants'

@singleton()
export class PostgresDataSource {
  private readonly pool: Pool
  private readonly logger: Logger

  constructor() {
    this.logger = container
      .resolve<Logger>(constants.LOGGER)
      .child({ context: 'Postgres' })

    this.logger.debug('Initialize PostgresDataSource with new Connection Pool.')
    this.pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'mysecretpassword',
      port: 5432,
    })
  }

  public async query<T>(
    query: string,
    ...params: unknown[]
  ): Promise<QueryResult<T>> {
    try {
      this.logger.debug(`Query: ${query}`)
      return await this.pool.query(query, params)
    } catch (e) {
      this.logger.error('Cannot query postgres. Error:' + e.message)
      throw new DatabaseError()
    }
  }

  public async getClient(): Promise<PostgresClient> {
    try {
      this.logger.debug(`Request Pool Client.`)
      const poolClient: PoolClient = await this.pool.connect()
      return new PostgresClient(poolClient, this.logger)
    } catch (e) {
      this.logger.error('Cannot connect to Pool Client. ' + e.message)
      throw new DatabaseError()
    }
  }
}
