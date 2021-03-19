import { Controller } from '../../../src/routing'
import { HttpResponse } from '../../../src/routing/http-response'
import constants from '../../../src/routing/constants'
import { FastifyRequest } from 'fastify'
import { RouteDefinition } from '../../../src/routing/route-definition'
import { Route } from '../../../src/routing/decorators/route'

describe('Router decorators', () => {
  @Controller('/testPath')
  class TestClass1 {
    @Route({
      produces: ['application/vnd.users+json'],
      consumes: ['application/vnd.users+xml'],
      httpMethod: 'GET',
      path: '/users',
    })
    public async get(
      _req: FastifyRequest,
      response: HttpResponse
    ): Promise<HttpResponse> {
      return response.ok()
    }

    @Route({
      produces: [
        'application/vnd.users+json',
        'application/vnd.users-admin+json',
      ],
      consumes: ['application/vnd.users+xml'],
      httpMethod: 'POST',
      path: '/users',
      schema: {
        body: {
          type: 'object',
        },
        headers: {
          type: 'object',
        },
      },
    })
    public async post(
      _req: FastifyRequest,
      response: HttpResponse
    ): Promise<HttpResponse> {
      return response.ok()
    }
  }

  @Controller()
  class TestClass2 {}

  it('should set Controller prefix if provided', () => {
    const test: TestClass1 = new TestClass1()

    const prefix: string = Reflect.getMetadata(
      constants.CONTROLLER,
      test.constructor
    )

    expect(prefix).toEqual('/testPath')
  })

  it('should set default Controller prefix is none is given', () => {
    const test: TestClass2 = new TestClass2()

    const prefix: string = Reflect.getMetadata(
      constants.CONTROLLER,
      test.constructor
    )

    expect(prefix).toEqual('/')
  })

  it('should set all routes in controller metadata', () => {
    const test: TestClass1 = new TestClass1()
    const routes: RouteDefinition[] = Reflect.getMetadata(
      constants.CONTROLLER_ROUTES,
      test.constructor
    )

    expect(routes).toHaveLength(2)
  })

  it('should not set routes if there are none', () => {
    const test: TestClass2 = new TestClass2()
    const routes: RouteDefinition[] = Reflect.getMetadata(
      constants.CONTROLLER_ROUTES,
      test.constructor
    )

    expect(routes).toBeUndefined()
  })

  it('should set metadata with Route()', () => {
    const test: TestClass1 = new TestClass1()
    const routes: RouteDefinition[] = Reflect.getMetadata(
      constants.CONTROLLER_ROUTES,
      test.constructor
    )

    const expectedRoute: RouteDefinition = {
      consumes: ['application/vnd.users+xml'],
      httpMethod: 'GET',
      method: 'get',
      path: '/users',
      produces: ['application/vnd.users+json'],
    }

    expect(routes).toContainRouteDefinition(expectedRoute)
  })

  it('should set metadata with schema with Route()', () => {
    const test: TestClass1 = new TestClass1()
    const routes: RouteDefinition[] = Reflect.getMetadata(
      constants.CONTROLLER_ROUTES,
      test.constructor
    )

    const expectedRoute: RouteDefinition = {
      consumes: ['application/vnd.users+xml'],
      httpMethod: 'POST',
      method: 'post',
      path: '/users',
      produces: [
        'application/vnd.users+json',
        'application/vnd.users-admin+json',
      ],
      schema: {
        body: {
          type: 'object',
        },
        headers: {
          type: 'object',
        },
      },
    }

    expect(routes).toContainRouteDefinition(expectedRoute)
  })
})
