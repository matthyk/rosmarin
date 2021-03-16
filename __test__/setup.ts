import 'reflect-metadata'
import MatcherContext = jest.MatcherContext
import CustomMatcherResult = jest.CustomMatcherResult
import { RouteDefinition } from '../src/routing/route-definition'

expect.extend({
  toContainRouteDefinition(
    this: MatcherContext,
    received: RouteDefinition[],
    argument: RouteDefinition
  ): CustomMatcherResult {
    const passed: boolean = this.equals(
      received,
      expect.arrayContaining([argument])
    )

    return {
      message: () =>
        passed
          ? ''
          : `Expected ${this.utils.printReceived(
              received
            )} to contain object ${this.utils.printExpected(argument)}`,
      pass: passed,
    }
  },
})
