import fastify, {
  AddContentTypeParser,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify'
import { Constructor, RouteStore } from './utility-types'
import { HttpMethod } from './http-method'
import { Logger } from 'pino'
import {
  RouteDefinition,
  RouteDefinitionWithValidationFn,
  Schemas,
} from './route-definition'
import constants from './constants'
import { errorCacheControl, errorHandler } from './error-handler'
import { RouteHandlerMethod } from 'fastify/types/route'
import { ContentNegotiator, NegotiationResult } from './content-negotiator'
import { HttpResponse } from './http-response'
import { RoutingError } from './routing-error'
import Ajv, { ValidateFunction } from 'ajv'
import { RouterConfig } from './router-config'

export class Router {
  private readonly fastify: FastifyInstance
  private readonly logger: Logger
  private readonly ajv

  constructor(
    logger: Logger,
    private readonly routerConfig: RouterConfig = {}
  ) {
    this.logger = logger.child({ context: 'Router' })

    this.fastify = fastify({
      ignoreTrailingSlash: true,
      onProtoPoisoning: 'error',
      onConstructorPoisoning: 'error',
      disableRequestLogging: false,
      logger,
    })

    this.addContentType = this.fastify.addContentTypeParser.bind(this.fastify)

    this.ajv = new Ajv({
      removeAdditional: true,
      useDefaults: true,
      coerceTypes: true,
      nullable: true,
    })
  }

  private configureFastify(): void {
    this.fastify.setErrorHandler(errorHandler)
    this.fastify.addContentTypeParser(
      /\+json$/,
      // See https://github.com/fastify/fastify/issues/2930
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.fastify.getDefaultJsonParser('error', 'error')
    )
    this.fastify.setValidatorCompiler(({ schema }) => {
      return this.ajv.compile(schema)
    })
  }

  public async listen(): Promise<void> {
    this.configureFastify()
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
        controllers.forEach((controller: Constructor) => {
          try {
            this.registerController(controller, fastify)
          } catch (error) {
            this.logger.error(
              `Error while register controller ${controller.name}.\n${error.stack}`
            )
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

    const instance = new controller()

    this.logger.debug(
      `Register Controller "${controller.name}". Start to search for routes...`
    )

    for (const [path, value] of Object.entries(routeStore)) {
      for (const [httpMethod, definition] of Object.entries(value)) {
        const compiledDefinition: RouteDefinitionWithValidationFn[] = this.compileRouteDefinitions(
          definition as RouteDefinition[]
        )

        fastify.route({
          method: httpMethod as HttpMethod,
          url: path,
          handler: this.createRouteHandler(compiledDefinition, instance),
        })

        this.logger.debug(
          `Registered { ${httpMethod} ${path} } route${
            compiledDefinition.length > 1
              ? ` with ${compiledDefinition.length} different handlers`
              : ''
          }.`
        )
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

  private createRouteHandler<T>(
    routeDefinitions: RouteDefinitionWithValidationFn[],
    controller: T
  ): RouteHandlerMethod {
    const contentNegotiator: ContentNegotiator = new ContentNegotiator(
      routeDefinitions
    )

    return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        const negotiationResult: NegotiationResult = contentNegotiator.retrieveHandler(
          req.headers.accept,
          req.headers['content-type']
        )

        this.validateRequest(
          req,
          negotiationResult.routeDefinition.validationFns
        )

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const response: HttpResponse = await controller[
          negotiationResult.routeDefinition.method
        ](req)

        reply
          .status(response.statusCode)
          .header('content-type', negotiationResult.acceptedMediaType)
          .headers(response.headers)
          .send(response.entity)
      } catch (e: unknown) {
        if (e instanceof RoutingError) {
          reply
            .header('Cache-Control', errorCacheControl)
            .status(e.statusCode)
            .send(e.toJSON())
        } else {
          errorHandler(e, req, reply)
        }
      }
    }
  }

  private validateRequest(
    req: FastifyRequest,
    validationFns: Schemas<ValidateFunction>
  ): void {
    // TODO: create user friendly error messages

    if (validationFns.body) {
      const valid = validationFns.body(req.body)
      if (!valid)
        throw new RoutingError(
          422,
          'Unprocessable Entity',
          'Validation of request body failed.'
        ) //TODO: 400 or 422?
    }

    if (validationFns.query) {
      const valid = validationFns.query(req.query)
      if (!valid)
        throw new RoutingError(
          422,
          'Unprocessable Entity',
          'Validation of request query parameters failed.'
        )
    }

    if (validationFns.params) {
      const valid = validationFns.params(req.params)
      if (!valid)
        throw new RoutingError(
          422,
          'Unprocessable Entity',
          'Validation of request path parameters failed.'
        )
    }

    if (validationFns.headers) {
      const valid = validationFns.headers(req.headers)
      if (!valid)
        throw new RoutingError(
          422,
          'Unprocessable Entity',
          'Validation of request headers failed.'
        )
    }
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
          body: this.compileSchema(definition.schema?.body),
          query: this.compileSchema(definition.schema?.query),
          headers: this.compileSchema(definition.schema?.headers),
          params: this.compileSchema(definition.schema?.params),
        },
      }
    })
  }

  private compileSchema(
    schema?: Record<string, unknown>
  ): ValidateFunction | undefined {
    return schema ? this.ajv.compile(schema) : undefined
  }
}
