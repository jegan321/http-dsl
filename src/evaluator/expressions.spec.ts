import { expect, test, beforeEach, describe } from 'vitest'
import { Environment } from './environment'
import { evaluateExpression } from './expressions'

describe('expressions', async () => {
  const environment = new Environment()
  beforeEach(() => {
    environment.reset()
  })
  test('should should evaluate string variable', async () => {
    environment.variables.message = 'Hello'
    const input = 'message'
    const result = await evaluateExpression(input, environment)
    expect(result).toBe('Hello')
  })
  test('should should evaluate number literals', async () => {
    const input = '1 + 2'
    const result = await evaluateExpression(input, environment)
    expect(result).toBe(3)
  })
  test('should should concatenate strings', async () => {
    environment.variables.first = 'John'
    environment.variables.last = 'Doe'
    const input = 'first + " " + last'
    const result = await evaluateExpression(input, environment)
    expect(result).toBe('John Doe')
  })
})
