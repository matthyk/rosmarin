import { FastifyRequest } from 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    acceptedMediaType: string

    baseUrl(): string

    fullUrl(): string

    evaluateConditionalGetRequest(
      lastModifiedAt: number | Date,
      etag: string
    ): boolean

    evaluateConditionalPutRequest(
      lastModifiedAt: number | Date,
      etag: string
    ): boolean
  }
}
