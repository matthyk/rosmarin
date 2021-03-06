import { Router } from './router'
import Pino, { Logger } from 'pino'
import { ApplicationConfig, LoggingOptions } from './application-config'
import { Constructor } from './types'
import { container } from 'tsyringe'
import constants from './constants'
import {
  IApiKeyInfoProvider,
  IAuthenticationInfoProvider,
  NoApiKeyProvider,
  NoAuthenticationInfoProvider,
} from './api'

export class RestApplication {
  private router: Router

  private readonly logger: Logger

  private readonly controllers: Constructor[] = []

  constructor(config: ApplicationConfig = {}) {
    this.logger = Pino(this.determineLoggingOptions(config.loggingOptions))

    this.logger.debug(`LOG LEVEL is set to ${this.logger.level.toUpperCase()}`)

    this.router = new Router(this.logger, {
      prefix: config.prefix,
      disableRequestLogging: true,
    })
  }

  private determineLoggingOptions(options: LoggingOptions): LoggingOptions {
    if (process.env.NODE_ENV === 'production') {
      return {
        prettyPrint: false,
        level: 'info',
      }
    }

    return {
      level: options?.level ?? 'trace',
      prettyPrint: options?.prettyPrint ?? true,
    }
  }

  private configureContainer(): void {
    if (
      container.isRegistered(constants.AUTHENTICATION_INFO_PROVIDER) === false
    ) {
      this.logger.info(
        `No AuthenticationInfoProvider registered. The NoAuthenticationInfoProvider will be used. Please register a provider with @AuthenticationInfoProvider.`
      )
      container.register(
        constants.AUTHENTICATION_INFO_PROVIDER,
        NoAuthenticationInfoProvider
      )
    }

    if (container.isRegistered(constants.API_KEY_INFO_PROVIDER) === false) {
      this.logger.info(
        `No ApiKeyInfoProvider registered. The default provider will be used. Please register a provider with @ApiKeyInfoProvider if you use API key verification in your application.`
      )
      container.register(constants.API_KEY_INFO_PROVIDER, NoApiKeyProvider)
    }

    container.registerInstance(constants.LOGGER, this.logger)
  }

  public registerApiKeyInfoProvider(
    provider: Constructor<IApiKeyInfoProvider>
  ): void {
    container.registerSingleton(constants.API_KEY_INFO_PROVIDER, provider)
  }

  public registerAuthenticationInfoProvider(
    provider: Constructor<IAuthenticationInfoProvider>
  ): void {
    container.registerSingleton(
      constants.AUTHENTICATION_INFO_PROVIDER,
      provider
    )
  }

  public registerController(...controllers: Constructor[]): void {
    this.controllers.push(...controllers)
  }

  public async start(port = 8080, host = '127.0.0.1'): Promise<void> {
    try {
      this.router.registerControllers(this.controllers)

      this.configureContainer()

      await this.router.listen(port, host)
    } catch (err) {
      this.logger.fatal('Cannot start application.\n' + err.stack)

      this.logger.fatal('Exit process with non-zero value.')

      process.exit(1)
    }
  }
}

process.on('unhandledRejection', (reason: string) => {
  throw new Error(reason)
})

process.on('uncaughtException', (error: Error) => {
  console.log('Uncaught Exception. ' + error.stack) // TODO replace console.log
  console.log('Exit process with non-zero value.')
  process.exit(1)
})
