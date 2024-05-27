import { expect, test, beforeEach, describe } from 'vitest'
import { Environment } from './environment'
import { replaceExpressionsInString } from './replace-expressions'

describe('replaceVariables', () => {
  const environment = new Environment()
  beforeEach(() => {
    environment.reset()
  })
  test('should return value as-is when there are no variables', () => {
    const input = 'https://api.example.com'
    const replaced = replaceExpressionsInString(environment, input)
    expect(replaced).toBe(input)
  })
  test('should return variable when variable exists in environment', () => {
    environment.set('id', '123')
    const input = '{{id}}'
    const replaced = replaceExpressionsInString(environment, input)
    expect(replaced).toBe('123')
  })
  test('should replace variable in URL', () => {
    environment.set('item_id', '123')
    const input = 'http://example.com/api/items/{{item_id}}'
    const replaced = replaceExpressionsInString(environment, input)
    expect(replaced).toBe('http://example.com/api/items/123')
  })
  test('should replace two variables', () => {
    environment.set('item_id', '123')
    environment.set('is_active', 'true')
    const input = '{{item_id}} and {{is_active}}'
    const replaced = replaceExpressionsInString(environment, input)
    expect(replaced).toBe('123 and true')
  })
  test('should replace object with JSON', () => {
    environment.set('person', {
      name: 'John'
    })
    const input = '{{person}}'
    const replaced = replaceExpressionsInString(environment, input)
    expect(replaced).toBe('{"name":"John"}')
  })
})
