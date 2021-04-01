import { FastifyRequest } from 'fastify'

export class ApiKeyHeader {
  private apiKey: string

  constructor(private readonly req: FastifyRequest) {}

  public getApiKey(apiKeyHeader: string): string {
    const apiKey: string | string[] = this.req.headers[apiKeyHeader]
    this.apiKey = Array.isArray(apiKey) ? apiKey[0] : apiKey
    return this.apiKey
  }
}
