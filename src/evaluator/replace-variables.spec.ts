import { expect, test, beforeEach, describe } from 'vitest'
import { Environment } from './environment'
import { replaceVariables } from './replace-variables'

describe('replaceVariables', async () => {
  const environment = new Environment(() => Promise.resolve('mock_value'))
  beforeEach(() => {
    environment.reset()
  })
  test('should return value as-is when there are no variables', async () => {
    const input = 'https://api.example.com'
    const replaced = await replaceVariables(environment, input)
    expect(replaced).toBe(input)
  })
  test('should return variable when variable exists in environment', async () => {
    environment.setVariable('id', '123')
    const input = '{{id}}'
    const replaced = await replaceVariables(environment, input)
    expect(replaced).toBe('123')
  })
  test('should return variable when variable has period and underscore', async () => {
    environment.setVariable('item_details.id', '123')
    const input = '{{item_details.id}}'
    const replaced = await replaceVariables(environment, input)
    expect(replaced).toBe('123')
  })
  test('should replace variable in URL', async () => {
    environment.setVariable('item_id', '123')
    const input = 'http://example.com/api/items/{{item_id}}'
    const replaced = await replaceVariables(environment, input)
    expect(replaced).toBe('http://example.com/api/items/123')
  })
  test('should replace two variables', async () => {
    environment.setVariable('item_id', '123')
    environment.setVariable('is_active', 'true')
    const input = '{{item_id}} and {{is_active}}'
    const replaced = await replaceVariables(environment, input)
    expect(replaced).toBe('123 and true')
  })
  test('should use UnknownVariableGetter when variable is not in environment', async () => {
    const input = 'http://example.com/api/items/{{item_id}}'
    const replaced = await replaceVariables(environment, input)
    expect(replaced).toBe('http://example.com/api/items/mock_value')
  })
})
