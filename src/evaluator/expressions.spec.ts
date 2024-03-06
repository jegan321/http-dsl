import { expect, test, beforeEach, describe } from 'vitest'
import { Environment } from './environment'
import { evaluateExpression } from './expressions'

describe('expressions', async () => {
  const environment = new Environment()
  beforeEach(() => {
    environment.reset()
  })
  test('should evaluate string variable', async () => {
    environment.variables.message = 'Hello'
    const input = 'message'
    const result = evaluateExpression(input, environment)
    expect(result).toBe('Hello')
  })
  test('should throw error when variable does not exist', async () => {
    const input = 'message'
    let errorMessage = ''
    try {
      evaluateExpression(input, environment)
    } catch (error) {
      errorMessage = (error as Error).message
    }
    expect(errorMessage).toBe('message is not defined')
  })
  test('should evaluate number literals', async () => {
    const input = '1 + 2'
    const result = evaluateExpression(input, environment)
    expect(result).toBe('3')
  })
  test('should concatenate strings', async () => {
    environment.variables.first = 'John'
    environment.variables.last = 'Doe'
    const input = 'first + " " + last'
    const result = evaluateExpression(input, environment)
    expect(result).toBe('John Doe')
  })
  test('should stringify object', async () => {
    environment.variables.person = {
        name: 'John'
    }
    const input = 'person'
    const result = evaluateExpression(input, environment)
    expect(result).toBe('{"name":"John"}')
  })
  test('should stringify array of strings', async () => {
    environment.variables.names = [
        'John', 'Jane'
    ]
    const input = 'names'
    const result = evaluateExpression(input, environment)
    expect(result).toBe('["John","Jane"]')
  })
  test('should stringify object inside array', async () => {
    environment.variables.people = [
        {
            name: 'John'
        }
    ]
    const input = 'people'
    const result = evaluateExpression(input, environment)
    expect(result).toBe('[{"name":"John"}]')
  })
  test('should stringify array map result', async () => {
    environment.variables.people = [
        {
            name: 'John'
        }
    ]
    const input = 'people.map(p => p.name.toUpperCase())'
    const result = evaluateExpression(input, environment)
    expect(result).toBe('["JOHN"]')
  })
  test('should use toString() result when object has toString() method', async () => {
    environment.variables.myObject = {
        stringify() {
            return 'Object string representation'
        }
    }
    const input = 'myObject'
    const result = evaluateExpression(input, environment)
    expect(result).toBe('Object string representation')
  })
})
