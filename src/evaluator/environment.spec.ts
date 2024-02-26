import { expect, test, describe } from 'vitest'
import { Environment } from './environment'

describe('getVariable', async () => {
  test('should should use UnknownVariableGetter when variable is not set', async () => {
    const environment = new Environment(() => Promise.resolve('mock_value'))
    const value = await environment.getVariable('unknown_variable')
    expect(value).toBe('mock_value')
  })
})
