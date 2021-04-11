import { Logger } from 'pino'
import { container } from 'tsyringe'
import constants from '../../constants'

export abstract class AbstractRepository {
  protected readonly logger: Logger

  protected constructor() {
    this.logger = container
      .resolve<Logger>(constants.LOGGER)
      .child({ context: this.constructor.name })
  }
}
