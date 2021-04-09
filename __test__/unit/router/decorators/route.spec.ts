import { Controller } from '../../../../src'
import { HttpResponse } from '../../../../src/router/http-response'
import { FastifyRequest } from 'fastify'
import { FullRouteDefinition } from '../../../../src/router/route-definitions'
import { Route } from '../../../../src/router/decorators'
import { routerMetadataStore } from '../../../../src/metadata-stores'

describe('@Route()', () => {
  @Controller('/testPath')
  class TestClass1 {
    @Route({
      produces: 'application/vnd.users+json',
      consumes: 'application/vnd.users+xml',
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
      produces: 'application/vnd.users+json',
      consumes: 'application/vnd.users+xml',
      httpMethod: 'POST',
      path: '/users',
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
    const metadata = routerMetadataStore['controllers'].get(TestClass1)

    expect(metadata.prefix).toEqual('/testPath')
  })

  it('should set default Controller prefix is none is given', () => {
    const metadata = routerMetadataStore['controllers'].get(TestClass2)

    expect(metadata.prefix).toEqual('/')
  })

  it('should set all routes in controller metadata', () => {
    const routes = routerMetadataStore['routes'].get(TestClass1)

    expect(routes).toHaveLength(2)
  })

  it('should not set routes if there are none', () => {
    const routes = routerMetadataStore['routes'].get(TestClass2)

    expect(routes).toBeUndefined()
  })

  it('should set metadata with Route()', () => {
    const routes = routerMetadataStore['routes'].get(TestClass1)

    const expectedRoute: FullRouteDefinition = {
      consumes: 'application/vnd.users+xml',
      httpMethod: 'GET',
      method: 'get',
      path: '/users',
      produces: 'application/vnd.users+json',
    }

    expect(routes).toContainRouteDefinition(expectedRoute)
  })
})
