import { FastifyRequest } from 'fastify'

// Arrow function would break the "this" binding
export function evaluateConditionalGetRequest(
  this: FastifyRequest,
  lastModifiedAt: number | Date,
  etag: string
): boolean {
  return (
    etag === this.headers['if-none-match'] ||
    new Date(this.headers['if-modified-since']).getTime() >
      (lastModifiedAt instanceof Date
        ? lastModifiedAt.getTime()
        : lastModifiedAt)
  )
}

// Aka Conditional PUT
export function evaluateConditionalPutRequest(
  this: FastifyRequest,
  lastModifiedAt: number | Date,
  etag: string
): boolean {
  return (
    etag === this.headers['if-match'] ||
    new Date(this.headers['if-unmodified-since']).getTime() >
      (lastModifiedAt instanceof Date
        ? lastModifiedAt.getTime()
        : lastModifiedAt)
  )
}
