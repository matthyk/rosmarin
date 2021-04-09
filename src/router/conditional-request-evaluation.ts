import { FastifyRequest } from 'fastify'

export const evaluate = (
  serverEtag: string,
  serverDate: number | Date,
  clientEtag: string,
  clientDate: string
): boolean => {
  return (
    serverEtag === clientEtag ||
    new Date(clientDate).getTime() >
      (serverDate instanceof Date ? serverDate.getTime() : serverDate)
  )
}

// Arrow function would break the "this" binding
export function evaluateConditionalGetRequest(
  this: FastifyRequest,
  lastModifiedAt: number | Date,
  etag: string
): boolean {
  return evaluate(
    etag,
    lastModifiedAt,
    this.headers['if-none-match'],
    this.headers['if-modified-since']
  )
}

// Aka Conditional PUT
export function evaluateConditionalPutRequest(
  this: FastifyRequest,
  lastModifiedAt: number | Date,
  etag: string
): boolean {
  return evaluate(
    etag,
    lastModifiedAt,
    this.headers['if-match'],
    this.headers['if-unmodified-since']
  )
}
