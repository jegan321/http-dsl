import { expect, test, beforeEach, describe } from 'vitest'
import { Environment } from './environment'
import { evaluateExpressionAsString } from './expressions'

describe('evaluateExpressionAsString', async () => {
  const environment = new Environment()
  beforeEach(() => {
    environment.reset()
  })
  test('should evaluate string variable', async () => {
    environment.set('message', 'Hello')
    const input = 'message'
    const result = evaluateExpressionAsString(input, environment)
    expect(result).toBe('Hello')
  })
  test('should throw error when variable does not exist', async () => {
    const input = 'message'
    let errorMessage = ''
    try {
      evaluateExpressionAsString(input, environment)
    } catch (error) {
      errorMessage = (error as Error).message
    }
    expect(errorMessage).toBe('message is not defined')
  })
  test('should evaluate number variable', async () => {
    environment.set('number', 123)
    const input = 'number'
    const result = evaluateExpressionAsString(input, environment)
    expect(result).toBe('123')
  })
  test('should evaluate boolean variable', async () => {
    environment.set('flag', true)
    const input = 'flag'
    const result = evaluateExpressionAsString(input, environment)
    expect(result).toBe('true')
  })
})
