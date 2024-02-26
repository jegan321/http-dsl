import { describe } from 'node:test'
import { expect, test } from 'vitest'
import { Environment } from './environment'
import { replaceVariables } from './replace-variables'

describe('replaceVariables', async () => {
  const environment = new Environment(
    () => Promise.resolve('mock value')
  )
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
})
