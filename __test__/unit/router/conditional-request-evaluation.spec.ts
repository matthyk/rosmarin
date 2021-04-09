import {
  evaluate,
  evaluateConditionalGetRequest,
  evaluateConditionalPutRequest,
} from '../../../src/router/conditional-request-evaluation'
import { FastifyRequest } from 'fastify'

describe('conditional request evaluation', () => {
  describe('evaluate', () => {
    it('should return true if etag matches', () => {
      expect(
        evaluate('dakshdg87asgd', 453459324, 'dakshdg87asgd', undefined)
      ).toBeTruthy()
    })

    it('should return true if lastModifiedAt date is earlier', () => {
      expect(
        evaluate(
          'dakshdg87asgd',
          new Date('Thu, 25 Mar 2021 14:43:28 GMT'),
          undefined,
          'Thu, 25 Mar 2021 14:43:30 GMT'
        )
      ).toBeTruthy()
    })

    it('should return true if etag OR date matches', () => {
      expect(
        evaluate(
          'dakshdg87asgd',
          new Date('Thu, 25 Mar 2021 14:43:28 GMT'),
          'dakshdg87asg',
          'Thu, 25 Mar 2021 14:43:30 GMT'
        )
      ).toBeTruthy()

      expect(
        evaluate(
          'dakshdg87asgd',
          new Date('Thu, 25 Mar 2021 14:43:32 GMT'),
          'dakshdg87asgd',
          'Thu, 25 Mar 2021 14:43:30 GMT'
        )
      ).toBeTruthy()
    })

    it('should return false if etag not matches', () => {
      expect(
        evaluate(
          'dakshdg87asgd',
          48905702934,
          'dakshdg87aerwerwersgd',
          undefined
        )
      ).toBeFalsy()
    })

    it('should return false if lastModifiedAt date is later', () => {
      expect(
        evaluate(
          'dakshdg87asgd',
          new Date('Thu, 25 Mar 2021 14:43:59 GMT'),
          undefined,
          'Thu, 25 Mar 2021 14:43:30 GMT'
        )
      ).toBeFalsy()
    })

    it('should return false if "if-modified-since" header is wrong formatted', () => {
      expect(
        evaluate(
          'dakshdg87asgd',
          new Date('Thu, 25 Mar 2021 14:43:25 GMT'),
          undefined,
          'Thu, 25 Mar 2021 14:43:30 GM'
        )
      ).toBeFalsy()
    })
  })

  describe('evaluateConditionalPutRequest', () => {
    it('should extract correct headers from request', () => {
      const request: FastifyRequest = {
        headers: {
          'if-match': 'djsndfoiaszFOdf',
          'if-unmodified-since': 'Thu, 25 Mar 2021 14:43:25 GMT',
        },
      } as FastifyRequest

      expect(
        evaluateConditionalPutRequest.call(
          request,
          8843859834523,
          'djsndfoiaszFOdf'
        )
      ).toBeTruthy()
    })
  })

  describe('evaluateConditionalGetRequest', () => {
    it('should extract correct headers from request', () => {
      const request: FastifyRequest = ({
        headers: {
          'if-none-match': 'djsndfoiaszFOdf',
          'if-modified-since': 'Thu, 25 Mar 2021 14:43:25 GMT',
        },
      } as any) as FastifyRequest

      expect(
        evaluateConditionalGetRequest.call(
          request,
          8843859834523,
          'djsndfoiaszFOdf'
        )
      ).toBeTruthy()
    })
  })
})
