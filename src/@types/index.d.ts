import { FastifyRequest } from 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    baseUrl: string
    fullUrl: string
    acceptedMediaType: string

    evaluatePreconditions(lastModifiedAt: number | Date, etag: string): boolean
  }
}
