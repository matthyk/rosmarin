import { singleton } from 'tsyringe'
import { PostgresDataSource } from '../../../database/data-sources/postgres/postgres-data-source'
import { LocationModel } from '../models/location-model'
import { NoContentDatabaseResult } from '../../../database/results/no-content-database-result'

export const createLocationTable = async (
  postgres: PostgresDataSource
): Promise<void> => {
  const query = `CREATE TABLE "LOCATION"(
                    locationId SERIAL PRIMARY KEY NOT NULL,
                    city VARCHAR(25) NOT NULL,
                    street VARCHAR(60) NOT NULL,
                    userid INTEGER,
                    CONSTRAINT fk_location
                        FOREIGN KEY(userid)
                            REFERENCES "USER"(userid)
                 );`

  await postgres.query(query)
}

@singleton()
export class LocationRepository {
  // private readonly logger: Logger

  constructor(private readonly source: PostgresDataSource) {
    // this.logger = container.resolve<Logger>(constants.LOGGER).child({ context: this.constructor.name })
  }

  public async create(
    location: LocationModel
  ): Promise<NoContentDatabaseResult> {
    const result = new NoContentDatabaseResult()

    try {
      const client = await this.source.getClient()

      await client.begin()

      const statement = `
      INSERT INTO "LOCATION"(city, street) VALUES ($1, $2) RETURNING *;
      `

      const queryResult = await client.query<{ locationid: number }>(
        statement,
        location.city,
        location.street
      )

      location.id = queryResult.rows[0].locationid

      await client.end()

      return result
    } catch (e) {
      result.setError(200, e.message)
      return result
    }
  }
}
