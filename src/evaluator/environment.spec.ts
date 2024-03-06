import { expect, test, describe } from 'vitest'
import { Environment } from './environment'
import exp from 'constants'

describe('reset', async () => {
  test('should should remove all variables', () => {
    const environment = new Environment()
    environment.variables.foo = 'bar'
    environment.variables.baz = 'qux'
    environment.reset()
    expect(environment.variables).toEqual({})
  })
})
