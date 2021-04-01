import 'reflect-metadata'
import Pino from 'pino'
import { Router } from '../../router'
import { container } from 'tsyringe'
import { NoApiKeyProvider } from '../../api/api-key/no-api-key-provider'
import { UserController } from './controller'
import { MyAuthProvider } from './auth-provider'
import constants from '../../constants'
;(async function main() {
  const logger = Pino({ prettyPrint: true, level: 'trace' })

  container.registerInstance(constants.LOGGER, logger)
  container.register(constants.API_KEY_INFO_PROVIDER, NoApiKeyProvider)
  container.register(constants.AUTHENTICATION_INFO_PROVIDER, MyAuthProvider)

  const router = new Router(logger, { prefix: '/api' })

  router.registerControllers(UserController)

  await router.listen(8080)
})()
