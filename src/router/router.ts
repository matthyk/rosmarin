import fastify, {
  AddContentTypeParser,
  FastifyInstance,
  FastifyRequest,
} from 'fastify'
import { RouteStore } from './types'
import { HttpMethod, validateRouteDefinitions } from './http-methods'
import { Logger } from 'pino'
import {
  CompiledRouteDefinition,
  FullRouteDefinition,
} from './route-definitions'
import { handleError, notFound } from './http-error-handling'
import { RouterConfig } from './router-config'
import { container } from 'tsyringe'
import ajv, { compileSchema } from './validation'
import { createRouteHandler } from './route-handler'
import {
  evaluateConditionalGetRequest,
  evaluateConditionalPutRequest,
} from './conditional-request-evaluation'
import { RouteHandlerMethod } from 'fastify/types/route'
import { RouteRegistrationError } from './errors/route-registration-error'
import { routerMetadataStore, ControllerMetadata } from '../metadata-stores'
import { sanitizeUrl } from './santizieUrl'
import { Constructor } from '../types'

const httpVerbRegex = /get|post|put|delete/i

const pathParameterRegex = /:/g

export class Router {
  private readonly fastify: FastifyInstance

  private readonly logger: Logger

  public readonly addContentType: AddContentTypeParser

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

  private configureFastify(fastify: FastifyInstance): void {
    const prefix = this.getPrefix()

    fastify.addContentTypeParser<string>(
      /\+json$/,
      { parseAs: 'string' },
      this.fastify.getDefaultJsonParser('error', 'ignore')
    )

    fastify.setErrorHandler(handleError)
    fastify.setNotFoundHandler(notFound)

    fastify.setValidatorCompiler(({ schema }) => {
      return ajv.compile(schema)
    })

    fastify.decorateRequest('acceptedMediaType', '')

    fastify.decorateRequest(
      'evaluateConditionalGetRequest',
      evaluateConditionalGetRequest
    )

    fastify.decorateRequest(
      'evaluateConditionalPutRequest',
      evaluateConditionalPutRequest
    )

    fastify.decorateRequest('fullUrl', function (this: FastifyRequest) {
      return sanitizeUrl(this.protocol + '://' + this.hostname + this.url)
    })

    fastify.decorateRequest('baseUrl', function (this: FastifyRequest) {
      return sanitizeUrl(this.protocol + '://' + this.hostname + prefix)
    })
  }

  public listen(port: number, host: string): Promise<string> {
    return this.fastify.listen({ port, host })
  }

  public registerControllers(controllers: Constructor[]): void {
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
    if (this.routerConfig.prefix) return sanitizeUrl(this.routerConfig.prefix)

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
      `Register Controller "${controller.name}". Start to search for routes.`
    )

    for (const [path, value] of Object.entries(routeStore)) {
      for (const [httpMethod, definitions] of Object.entries(value)) {
        try {
          this.validateRegisteredRouterPath(path)

          /*
          We validate the route definitions before we compile and register them.
          We are very strict about this to prevent non HTTP/ REST compliant development in any case.
          */
          validateRouteDefinitions(
            <FullRouteDefinition[]>definitions,
            <HttpMethod>httpMethod,
            instance.constructor.name
          )

          const compiledDefinition: CompiledRouteDefinition[] = this.compileRouteDefinitions(
            definitions as FullRouteDefinition[]
          )

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
            `Registered [ ${httpMethod} ${path} ] route${
              compiledDefinition.length > 1
                ? ` with ${compiledDefinition.length} different handlers`
                : ''
            }.`
          )
        } catch (err) {
          if (err instanceof RouteRegistrationError) {
            this.logger.warn(
              `Registration of route [ ${httpMethod} ${path} ] will be skipped. Reason: ${
                err.message
              }${
                typeof err.details !== 'undefined'
                  ? '\nSee details: ' + err.details
                  : ''
              }`
            )
          } else {
            this.logger.error(
              `Registration of route [ ${httpMethod} ${path} ] failed unexpectedly and will be skipped. ${err.stack}`
            )
          }
        }
      }
    }
  }

  private buildRoutes(controller: Constructor): RouteStore | undefined {
    const store: RouteStore = {}

    const controllerMetadata: ControllerMetadata = routerMetadataStore.getController(
      controller
    )

    if (typeof controllerMetadata?.prefix === 'undefined') return undefined

    const routes: FullRouteDefinition[] = routerMetadataStore.getRoutes(
      controller
    )

    for (const routeDefinition of routes) {
      const fullPath: string = sanitizeUrl(
        controllerMetadata.prefix + (routeDefinition.path ?? '/')
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

  private compileRouteDefinitions = (
    definitions: FullRouteDefinition[]
  ): CompiledRouteDefinition[] => {
    return definitions.map((definition: FullRouteDefinition) => {
      return {
        produces: definition.produces,
        consumes: definition.consumes,
        method: definition.method,
        validationAndTransformation: {
          body: {
            validationFn: compileSchema(definition.schema?.body.schema),
            transformationFn: definition.schema?.body?.transformer,
          },
          query: compileSchema(definition.schema?.query),
          params: compileSchema(definition.schema?.params),
          headers: compileSchema(definition.schema?.headers),
        },
        viewConverter: definition.viewConverter,
      }
    })
  }

  private validateRegisteredRouterPath(path: string): void {
    if (httpVerbRegex.test(path)) {
      this.logger.warn(
        `Path '${path}' looks like you are using a verb in it. But that's evil and you probably shouldn't do that.`
      )
    }

    if ((path.match(pathParameterRegex) ?? []).length >= 2) {
      this.logger.warn(`WARNING.`) // TODO
    }
  }
}
