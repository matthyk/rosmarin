import { Controller, Router } from '../../../src'
import { FastifyRequest } from 'fastify'
import { HttpResponse } from '../../../src/router/http-response'
import { RouteStore } from '../../../src/utility-types'
import Pino, { Logger } from 'pino'
// import Mock = jest.Mock
import { Route } from '../../../src/router/decorators'

const logger: Logger = Pino()

// const mockHandler = (_req: FastifyRequest, _reply: FastifyReply) => {}

describe('router', () => {
  class TestClass1 {}

  @Controller()
  class TestClass2 {}

  @Controller()
  class TestClass3 {
    @Route({
      path: '/test',
      httpMethod: 'GET',
    })
    public async test(
      _req: FastifyRequest,
      response: HttpResponse
    ): Promise<HttpResponse> {
      return response.ok()
    }
  }

  describe('buildRoutes', () => {
    @Controller('/prefix/')
    class TestClass4 {
      @Route({
        path: '/test/',
        httpMethod: 'GET',
      })
      public async test(
        _req: FastifyRequest,
        response: HttpResponse
      ): Promise<HttpResponse> {
        return response.ok()
      }
    }

    @Controller('/users')
    class TestClass5 {
      @Route({
        path: '/',
        httpMethod: 'POST',
      })
      public async test1(
        _req: FastifyRequest,
        response: HttpResponse
      ): Promise<HttpResponse> {
        return response.ok()
      }

      @Route({
        path: '/:id',
        httpMethod: 'GET',
      })
      public async test2(
        _req: FastifyRequest,
        response: HttpResponse
      ): Promise<HttpResponse> {
        return response.ok()
      }
    }

    @Controller('/books')
    class TestClass6 {
      @Route({
        path: '/',
        httpMethod: 'GET',
      })
      public async test1(
        _req: FastifyRequest,
        response: HttpResponse
      ): Promise<HttpResponse> {
        return response.ok()
      }

      @Route({
        path: '/',
        httpMethod: 'GET',
      })
      public async test2(
        _req: FastifyRequest,
        response: HttpResponse
      ): Promise<HttpResponse> {
        return response.ok()
      }
    }

    @Controller('/urls')
    class TestClass7 {
      @Route({
        path: '/test/',
        httpMethod: 'GET',
      })
      public async test1(
        _req: FastifyRequest,
        response: HttpResponse
      ): Promise<HttpResponse> {
        return response.ok()
      }

      @Route({
        path: '/test',
        httpMethod: 'GET',
      })
      public async test2(
        _req: FastifyRequest,
        response: HttpResponse
      ): Promise<HttpResponse> {
        return response.ok()
      }
    }

    const router: Router = new Router(logger)

    it('should return "undefined" if controller was not decorated with @Controller()', () => {
      const routeStore: RouteStore | undefined = router['buildRoutes'](
        TestClass1
      )

      expect(routeStore).toBeUndefined()
    })

    it('should return empty store if controller has no routes', () => {
      const routeStore: RouteStore | undefined = router['buildRoutes'](
        TestClass2
      )

      expect(Object.keys(routeStore)).toHaveLength(0)
    })

    it('should store simple route without prefix', () => {
      const routeStore: RouteStore | undefined = router['buildRoutes'](
        TestClass3
      )

      expect(Object.keys(routeStore)).toHaveLength(1)
      expect(routeStore['/test']).toBeDefined()
      expect(routeStore['/test']['GET']).toBeDefined()
      expect(routeStore['/test']['GET']).toHaveLength(1)
      expect(routeStore['/test']['GET'][0]).toEqual({
        path: '/test',
        httpMethod: 'GET',
        method: 'test',
      })
    })

    it('should store simple route with prefix', () => {
      const routeStore: RouteStore | undefined = router['buildRoutes'](
        TestClass4
      )

      expect(Object.keys(routeStore)).toHaveLength(1)
      expect(routeStore['/prefix/test']).toBeDefined()
      expect(routeStore['/prefix/test']['GET']).toBeDefined()
      expect(routeStore['/prefix/test']['GET']).toHaveLength(1)
      expect(routeStore['/prefix/test']['GET'][0]).toEqual({
        path: '/test/',
        httpMethod: 'GET',
        method: 'test',
      })
    })

    it('should store different routes separate', () => {
      const routeStore: RouteStore | undefined = router['buildRoutes'](
        TestClass5
      )

      expect(Object.keys(routeStore)).toHaveLength(2)
      expect(routeStore['/users/:id']).toBeDefined()
      expect(routeStore['/users/:id']['GET']).toBeDefined()
      expect(routeStore['/users/:id']['GET']).toHaveLength(1)
      expect(routeStore['/users/:id']['GET'][0]).toEqual({
        path: '/:id',
        httpMethod: 'GET',
        method: 'test2',
      })
      expect(routeStore['/users']).toBeDefined()
      expect(routeStore['/users']['POST']).toBeDefined()
      expect(routeStore['/users']['POST']).toHaveLength(1)
      expect(routeStore['/users']['POST'][0]).toEqual({
        path: '/',
        httpMethod: 'POST',
        method: 'test1',
      })
    })

    it('should store Related routes in same array', () => {
      const routeStore: RouteStore | undefined = router['buildRoutes'](
        TestClass6
      )

      expect(Object.keys(routeStore)).toHaveLength(1)
      expect(routeStore['/books']).toBeDefined()
      expect(routeStore['/books']['GET']).toBeDefined()
      expect(routeStore['/books']['GET']).toHaveLength(2)
      expect(routeStore['/books']['GET'][0]).toEqual({
        path: '/',
        httpMethod: 'GET',
        method: 'test1',
      })
      expect(routeStore['/books']['GET'][1]).toEqual({
        path: '/',
        httpMethod: 'GET',
        method: 'test2',
      })
    })

    it('should sanitize url', () => {
      const routeStore: RouteStore | undefined = router['buildRoutes'](
        TestClass7
      )
      expect(Object.keys(routeStore)).toHaveLength(1)
    })
  })

  /*
  describe('registerController', () => {
    @Controller('/users/')
    class TestClass4 {
      @Route({
        path: '/:id',
        produces: 'application/json',
        httpMethod: 'GET',
      })
      public async getUser(
        _req: FastifyRequest,
        response: HttpResponse
      ): Promise<HttpResponse> {
        return response.ok()
      }

      @Route({
        path: '/:id',
        produces: ['application/xml'],
        httpMethod: 'GET',
      })
      public async getUserAsXml(
        _req: FastifyRequest,
        response: HttpResponse
      ): Promise<HttpResponse> {
        return response.ok()
      }
    }

    @Controller('/books/')
    class TestClass5 {
      @Route({
        path: '/:id',
        httpMethod: 'GET',
      })
      public async getBook(
        _req: FastifyRequest,
        response: HttpResponse
      ): Promise<HttpResponse> {
        return response.ok()
      }

      @Route({
        path: '',
        httpMethod: 'GET',
      })
      public async getAllBooks(
        _req: FastifyRequest,
        response: HttpResponse
      ): Promise<HttpResponse> {
        return response.ok()
      }
    }

    const server: FastifyInstance = fastify()
    let router: Router
    let createRouteHandlerMock: Mock
    let compileRouteDefinitionsMock: Mock
    let routeMock: Mock

    beforeEach(() => {
      router = new Router(logger)

      createRouteHandlerMock = jest.fn()
      createRouteHandlerMock.mockReturnValue(mockHandler)
      router['createRouteHandler'] = createRouteHandlerMock

      compileRouteDefinitionsMock = jest.fn()
      compileRouteDefinitionsMock.mockReturnValue([])
      router['compileRouteDefinitions'] = compileRouteDefinitionsMock

      routeMock = jest.fn()
      server['route'] = routeMock
    })

    it('should not register routes for empty controller', () => {
      router.registerController(TestClass1, server)

      expect(createRouteHandlerMock.mock.calls).toHaveLength(0)
      expect(compileRouteDefinitionsMock.mock.calls).toHaveLength(0)
      expect(routeMock.mock.calls).toHaveLength(0)
    })

    it('should register single route', () => {
      router.registerController(TestClass3, server)

      expect(createRouteHandlerMock.mock.calls).toHaveLength(1)
      expect(compileRouteDefinitionsMock.mock.calls).toHaveLength(1)
      expect(routeMock.mock.calls).toHaveLength(1)
    })

    it('should register route with 2 handlers', () => {
      router.registerController(TestClass4, server)

      expect(createRouteHandlerMock.mock.calls).toHaveLength(1)
      expect(compileRouteDefinitionsMock.mock.calls).toHaveLength(1)
      expect(routeMock.mock.calls).toHaveLength(1)
      expect(routeMock.mock.calls[0][0]).toEqual({
        method: 'GET',
        url: '/users/:id',
        handler: mockHandler,
      })
    })

    it('should register 2 different routes', () => {
      router.registerController(TestClass5, server)

      expect(createRouteHandlerMock.mock.calls).toHaveLength(2)
      expect(compileRouteDefinitionsMock.mock.calls).toHaveLength(2)
      expect(routeMock.mock.calls).toHaveLength(2)
      expect(routeMock.mock.calls[0][0]).toEqual({
        method: 'GET',
        url: '/books/:id',
        handler: mockHandler,
      })
      expect(routeMock.mock.calls[1][0]).toEqual({
        method: 'GET',
        url: '/books',
        handler: mockHandler,
      })
    })
  })
  */

  describe('sanitizeUrl', () => {
    it('should remove multiple leading slashes', () => {
      const url: string = Router['sanitizeUrl']('///users', '/:id')

      expect(url).toEqual('/users/:id')
    })

    it('should remove all closing slashes', () => {
      const url: string = Router['sanitizeUrl']('/tests/', '//')

      expect(url).toEqual('/tests')
    })

    it('should remove multiple embedded slashes', () => {
      const url: string = Router['sanitizeUrl']('/tests//', '/:id///lol')

      expect(url).toEqual('/tests/:id/lol')
    })
  })
})
