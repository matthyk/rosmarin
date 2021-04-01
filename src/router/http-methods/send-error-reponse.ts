import { FastifyReply } from 'fastify'
import { serializeErrorResponse } from '../serialization'

export const sendErrorResponse = (
  reply: FastifyReply,
  error: unknown
): void => {
  // Why no status code is set? Because the status code is already set in a state
  reply
    .serializer(serializeErrorResponse)
    .type('application/vnd.error+json')
    .send(error)
}
