import { singleton } from 'tsyringe'
import { PostgresDataSource } from '../../../database/data-sources/postgres/postgres-data-source'
import { UserModel } from '../models/user-model'
import { NoContentDatabaseResult } from '../../../database/results/no-content-database-result'
import { SingleModelDatabaseResult } from '../../../database/results/single-model-database-result'
import { CollectionModelDatabaseResult } from '../../../database/results/collection-model-database-result'
import { LocationModel } from '../models/location-model'

export const createUserTable = async (
  postgres: PostgresDataSource
): Promise<void> => {
  const query = `CREATE TABLE "USER"(
        userId SERIAL PRIMARY KEY NOT NULL,
        name VARCHAR(25) NOT NULL,
        password VARCHAR(60) NOT NULL
     );`

  await postgres.query(query)
}

@singleton()
export class UserRepository {
  // private readonly logger: Logger

  constructor(private readonly source: PostgresDataSource) {
    // this.logger = container.resolve<Logger>(constants.LOGGER).child({ context: this.constructor.name })
  }

  public async create(user: UserModel): Promise<NoContentDatabaseResult> {
    const result = new NoContentDatabaseResult()

    try {
      const client = await this.source.getClient()

      await client.begin()

      let statement = `
      INSERT INTO "USER"(name, password) VALUES ($1, $2) RETURNING *;
      `

      const queryResult = await client.query<{ userid: number }>(
        statement,
        user.name,
        user.password
      )

      user.id = queryResult.rows[0].userid

      statement = `
          INSERT INTO "LOCATION"(city, street, userid) VALUES ($1, $2, $3) RETURNING *;
      `

      const locationQueryResult = await client.query<{ locationid: number }>(
        statement,
        user.location.city,
        user.location.street,
        user.id
      )

      user.location.id = locationQueryResult.rows[0].locationid

      await client.end()

      return result
    } catch (e) {
      result.setError(200, e.message)
      return result
    }
  }

  public async readById(
    id: number | string
  ): Promise<SingleModelDatabaseResult<UserModel>> {
    const user = new UserModel(id)

    const statement = `
        SELECT "USER".userid, name, city, street, locationid
        FROM "USER"
        INNER JOIN "LOCATION"
        ON "LOCATION".userid = "USER".userid
        WHERE "USER".userid = $1
    `

    const queryResult = await this.source.query<any>(statement, id)

    if (queryResult.rows.length === 0) {
      return new SingleModelDatabaseResult<UserModel>()
    }

    user.name = queryResult.rows[0].name
    user.id = queryResult.rows[0].userid
    user.location = new LocationModel(queryResult.rows[0].locationid)
    user.location.street = queryResult.rows[0].street
    user.location.city = queryResult.rows[0].city

    return new SingleModelDatabaseResult<UserModel>(user)
  }

  public async readAll(): Promise<CollectionModelDatabaseResult<UserModel>> {
    const statement = `
      SELECT "USER".userid, name, city, street, locationid
      FROM "USER"
      INNER JOIN "LOCATION"
      ON "LOCATION".userid = "USER".userid
    `

    const queryResult = await this.source.query<{
      userid: string
      name: string
      city: string
      street: string
      locationid: string
    }>(statement)

    const users: UserModel[] = queryResult.rows.map((row) => {
      const user = new UserModel(row.userid)
      user.name = row.name
      user.location = new LocationModel(row.locationid)
      user.location.city = row.city
      user.location.street = row.street
      return user
    })

    return new CollectionModelDatabaseResult<UserModel>(users)
  }

  public async update(user: UserModel): Promise<NoContentDatabaseResult> {
    try {
      const statement = `
        UPDATE "USER"
        SET name = $1
        WHERE userid = $2
      `

      await this.source.query<any>(statement, user.name, user.id)

      return new NoContentDatabaseResult()
    } catch (e) {
      const result = new NoContentDatabaseResult()
      result.setError(100, e.message)

      return result
    }
  }

  public async deleteById(
    id: number | string
  ): Promise<NoContentDatabaseResult> {
    const client = await this.source.getClient()

    await client.begin()

    let statement = `
        DELETE FROM "LOCATION"
        WHERE userid = $1
    `

    await this.source.query<any>(statement, id)

    statement = `
        DELETE FROM "USER"
        WHERE userid = $1
      `

    await this.source.query<any>(statement, id)

    await client.end()

    return new NoContentDatabaseResult()
  }

  public async readPassword(
    id: string | number
  ): Promise<SingleModelDatabaseResult<UserModel>> {
    const user = new UserModel(id)

    const statement = `
        SELECT "USER".userid, password
        FROM "USER"
        WHERE "USER".userid = $1
    `

    const queryResult = await this.source.query<{ password: string }>(
      statement,
      id
    )

    if (queryResult.rows.length === 0) {
      return new SingleModelDatabaseResult<UserModel>()
    }

    user.password = queryResult.rows[0].password

    return new SingleModelDatabaseResult<UserModel>(user)
  }
}
