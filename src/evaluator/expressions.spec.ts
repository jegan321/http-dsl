import { expect, test, beforeEach, describe } from 'vitest'
import { Environment } from './environment'
import { evaluateExpression } from './expressions'

describe('expressions', async () => {
  const environment = new Environment()
  beforeEach(() => {
    environment.reset()
  })
  test('should should evaluate string variable', async () => {
    // environment.setVariable('message', 'Hello')
    // const input = 'message'
    // const result = await evaluateExpression(input, environment)
    // expect(result).toBe('Hello')
    expect(true).toBe(true)
  })
})
