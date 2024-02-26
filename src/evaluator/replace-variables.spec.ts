import { describe } from 'node:test'
import { expect, test } from 'vitest'
import { Environment } from './environment'
import { replaceVariables } from './replace-variables'

describe('replaceVariables', () => {
  test('should return value as-is when there are no variables', () => {
    const environment = new Environment()
    const input = 'https://api.example.com'
    const replaced = replaceVariables(environment, input)
    expect(replaced).toBe(input)
  })
  test('should return variable when variable exists in environment', () => {
    const environment = new Environment()
    environment.set('id', '123')
    const input = '{{id}}'
    const replaced = replaceVariables(environment, input)
    expect(replaced).toBe('123')
  })
  test('should return variable when variable has period', () => {
    const environment = new Environment()
    environment.set('item.id', '123')
    const input = '{{item.id}}'
    const replaced = replaceVariables(environment, input)
    expect(replaced).toBe('123')
  })
  test('should replace variable in URL', () => {
    const environment = new Environment()
    environment.set('item_id', '123')
    const input = 'http://example.com/api/items/{{item_id}}'
    const replaced = replaceVariables(environment, input)
    expect(replaced).toBe('http://example.com/api/items/123')
  })
})
