import 'reflect-metadata'
import MatcherContext = jest.MatcherContext
import CustomMatcherResult = jest.CustomMatcherResult
import { FullRouteDefinition } from '../src/router/route-definitions'

expect.extend({
  toContainRouteDefinition(
    this: MatcherContext,
    received: FullRouteDefinition[],
    argument: FullRouteDefinition
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
