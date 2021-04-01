import fastify, {
  AddContentTypeParser,
  FastifyInstance,
  FastifyRequest,
} from 'fastify'
import { Constructor, RouteStore } from './utility-types'
import { HttpMethod } from './http-methods'
import { Logger } from 'pino'
import {
  CompiledRouteDefinition,
  FullRouteDefinition,
} from './route-definitions'
import { handleError, notFound } from "./error-handler";
import { RouterConfig } from './router-config'
import { container } from 'tsyringe'
import { buildSerializationFn } from './serialization'
import ajv, { buildValidatorAndTransformerFn } from './validation'
import { createRouteHandler } from './route-handler'
import {
  evaluateConditionalGetRequest,
  evaluateConditionalPutRequest,
} from './conditional-request-evaluation'
import { RouteHandlerMethod } from 'fastify/types/route'
import constants from '../constants'

export class Router {
  private readonly fastify: FastifyInstance

  private readonly logger: Logger

  public addContentType: AddContentTypeParser

  constructor(
    logger: Logger,
    private readonly routerConfig: RouterConfig = {}
  ) {
    this.logger = logger.child({ context: 'Router' })
    this.fastify = fastify({
      ignoreTrailingSlash: true,
      onProtoPoisoning: 'error',
      onConstructorPoisoning: 'error',
      disableRequestLogging: routerConfig.disableRequestLogging ?? false,
      logger,
    })

    this.addContentType = this.fastify.addContentTypeParser.bind(this.fastify)
  }

  private configureFastify(): void {
    const prefix = this.getPrefix()

    this.fastify.addContentTypeParser<string>(
      /\+json$/,
      { parseAs: 'string' },
      // see https://github.com/fastify/fastify/pull/2961
      // should be fixed in Fastify version 3.14.2
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.fastify.getDefaultJsonParser('error', 'ignore')
    )

    this.fastify.setErrorHandler(handleError)
    this.fastify.setNotFoundHandler(notFound)

    this.fastify.setValidatorCompiler(({ schema }) => {
      return ajv.compile(schema)
    })

    this.fastify.decorateRequest('acceptedMediaType', '')

    this.fastify.decorateRequest(
      'evaluateConditionalGetRequest',
      evaluateConditionalGetRequest
    )

    this.fastify.decorateRequest(
      'evaluateConditionalPutRequest',
      evaluateConditionalPutRequest
    )

    this.fastify.decorateRequest('fullUrl', function (this: FastifyRequest) {
      return this.protocol + '://' + this.hostname + this.url
    })

    this.fastify.decorateRequest('baseUrl', function (this: FastifyRequest) {
      return this.protocol + '://' + this.hostname + prefix
    })
  }

  public listen(port = 3000, host?: string): Promise<string> {
    return this.fastify.listen({ port, host })
  }

  public registerControllers(...controllers: Constructor[]): void {
    this.configureFastify()

    this.fastify.register(
      (
        fastify: FastifyInstance,
        _opts: unknown,
        done: (err?: Error | undefined) => void
      ) => {
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
        `Skip controller "${controller.name}" because it was not registered as a controller. Did you decorate it with @Controller()?`
      )

    // Retrieve the controller instance via the DI container to allow the user to inject other dependencies
    const instance = container.resolve(controller)

    this.logger.debug(
      `Register Controller "${controller.name}". Start to search for routes...`
    )

    for (const [path, value] of Object.entries(routeStore)) {
      for (const [httpMethod, definition] of Object.entries(value)) {
        const compiledDefinition: CompiledRouteDefinition[] = this.compileRouteDefinitions(
          definition as FullRouteDefinition[]
        )

        try {
          const handler: RouteHandlerMethod = createRouteHandler(
            compiledDefinition,
            instance,
            httpMethod as HttpMethod
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
          this.logger.error(
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

    const routes: FullRouteDefinition[] = Reflect.getMetadata(
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
          ...(store[fullPath][
            routeDefinition.httpMethod
          ] as FullRouteDefinition[]),
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
    definitions: FullRouteDefinition[]
  ): CompiledRouteDefinition[] => {
    return definitions.map((definition: FullRouteDefinition) => {
      return {
        produces: definition.produces,
        consumes: definition.consumes,
        method: definition.method,
        validationAndTransformation: {
          body: buildValidatorAndTransformerFn(definition.schema?.body),
          query: buildValidatorAndTransformerFn(definition.schema?.query),
          params: buildValidatorAndTransformerFn(definition.schema?.params),
        },
        stringifyFn: buildSerializationFn(definition.outputSchema),
      }
    })
  }
}
