import 'reflect-metadata'
import { RestApplication } from '../../src'
import { UserController } from './user/user.controller'

async function main(): Promise<void> {
  const app = new RestApplication({
    prefix: '/api',
  })

  app.registerController(UserController)

  await app.start()
}

main()
