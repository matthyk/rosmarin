import fastify, { AddContentTypeParser, FastifyInstance } from 'fastify'
import { Constructor, RouteStore } from './utility-types'
import { HttpMethod } from './http-method'
import { Logger } from 'pino'
import {
  RouteDefinition,
  RouteDefinitionWithValidationFn,
} from './route-definition'
import constants from './constants'
import { errorHandler } from './error-handler'
import { RouterConfig } from './router-config'
import { container } from 'tsyringe'
import { createSerializationFn } from './serialization'
import ajv, { compileValidationSchema } from './validation'
import { createRouteHandler } from './route-handler'
import { evaluateConditionalRequest } from './conditional-request-evaluation'
import { RouteHandlerMethod } from 'fastify/types/route'

export class Router {
  private readonly fastify: FastifyInstance
  private readonly logger: Logger

  constructor(
    logger: Logger,
    private readonly routerConfig: RouterConfig = {}
  ) {
    this.logger = logger.child({ context: 'Router' })

    this.fastify = fastify({
      ignoreTrailingSlash: true,
      onProtoPoisoning: 'error',
      onConstructorPoisoning: 'error',
      disableRequestLogging: routerConfig.disableRequestLogging ?? true,
      logger,
    })

    // TODO: fix
    this.addContentType = this.fastify.addContentTypeParser.bind(this.fastify)
  }

  private configureFastify(fastify: FastifyInstance): void {
    fastify.addContentTypeParser<string>(
      /\+json$/,
      { parseAs: 'string' },
      fastify.defaultTextParser
    )

    fastify.setErrorHandler(errorHandler)

    fastify.setValidatorCompiler(({ schema }) => {
      return ajv.compile(schema)
    })

    fastify.decorateRequest('baseUrl', '')
    fastify.decorateRequest('fullUrl', '')
    fastify.decorateRequest('acceptedMediaType', '')
    fastify.decorateRequest('evaluatePreconditions', evaluateConditionalRequest)
  }

  public async listen(): Promise<void> {
    await this.fastify.listen(3000)
  }

  public addContentType: AddContentTypeParser

  public registerControllers(...controllers: Constructor[]): void {
    this.fastify.register(
      (
        fastify: FastifyInstance,
        _opts: unknown,
        done: (err?: Error | undefined) => void
      ) => {
        this.configureFastify(fastify)

        controllers.forEach((controller: Constructor) => {
          try {
            this.registerController(controller, fastify)
          } catch (error) {
            this.logger.error(
              `Error while register controller ${controller.name}.\n${error.stack}`
            )
            done(error)
          }
        })
        done()
      },
      { prefix: this.getPrefix() }
    )
  }

  private getPrefix(): string {
    if (this.routerConfig.prefix)
      return Router.sanitizeUrl(this.routerConfig.prefix, '')

    return ''
  }

  public registerController(
    controller: Constructor,
    fastify: FastifyInstance
  ): void {
    const routeStore: RouteStore | undefined = this.buildRoutes(controller)

    if (!routeStore)
      return this.logger.debug(
        `Skip controller "${controller.name}". Did you decorate it with @Controller()?`
      )

    const instance = container.resolve(controller)

    this.logger.debug(
      `Register Controller "${controller.name}". Start to search for routes...`
    )

    for (const [path, value] of Object.entries(routeStore)) {
      for (const [httpMethod, definition] of Object.entries(value)) {
        const compiledDefinition: RouteDefinitionWithValidationFn[] = this.compileRouteDefinitions(
          definition as RouteDefinition[]
        )

        try {
          const handler: RouteHandlerMethod = createRouteHandler(
            compiledDefinition,
            instance
          )

          fastify.route({
            method: httpMethod as HttpMethod,
            url: path,
            handler,
          })

          this.logger.debug(
            `Registered { ${httpMethod} ${path} } route${
              compiledDefinition.length > 1
                ? ` with ${compiledDefinition.length} different handlers`
                : ''
            }.`
          )
        } catch (e) {
          this.logger.warn(
            `Registration of route { ${httpMethod} ${path} } failed and will be skipped. ${e.message}`
          )
        }
      }
    }
  }

  private buildRoutes(controller: Constructor): RouteStore | undefined {
    const store: RouteStore = {}

    const prefix: string = Reflect.getMetadata(constants.CONTROLLER, controller)

    if (typeof prefix === 'undefined') return undefined

    const routes: RouteDefinition[] = Reflect.getMetadata(
      constants.CONTROLLER_ROUTES,
      controller
    )

    for (const routeDefinition of routes ?? []) {
      const fullPath: string = Router.sanitizeUrl(
        prefix,
        routeDefinition.path ?? '/'
      )

      if (!store[fullPath]) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        store[fullPath] = {}
      }

      if (store[fullPath][routeDefinition.httpMethod]) {
        store[fullPath][routeDefinition.httpMethod] = [
          ...(store[fullPath][routeDefinition.httpMethod] as RouteDefinition[]),
          routeDefinition,
        ]
      } else {
        store[fullPath][routeDefinition.httpMethod] = [routeDefinition]
      }
    }

    return store
  }

  private static sanitizeUrl(prefix: string, path: string): string {
    const url: string = prefix + path
    return (
      '/' +
      url
        .split(/\//g)
        .filter((s) => s)
        .join('/')
    )
  }

  private compileRouteDefinitions = (
    definitions: RouteDefinition[]
  ): RouteDefinitionWithValidationFn[] => {
    return definitions.map((definition: RouteDefinition) => {
      return {
        produces: definition.produces,
        consumes: definition.consumes,
        method: definition.method,
        validationFns: {
          body: compileValidationSchema(definition.schema?.body),
          query: compileValidationSchema(definition.schema?.query),
          headers: compileValidationSchema(definition.schema?.headers),
          params: compileValidationSchema(definition.schema?.params),
        },
        stringifyFn: createSerializationFn(definition.outputSchema),
      }
    })
  }
}
