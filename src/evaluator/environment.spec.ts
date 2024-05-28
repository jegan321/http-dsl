import { expect, test, describe } from 'vitest'
import { Environment } from './environment'

describe('Environment', async () => {
  test('reset() should remove all variables', () => {
    const environment = new Environment()
    environment.set('foo', 'bar')
    environment.set('baz', 'qux')
    environment.reset()
    expect(environment.getVariables()).toEqual({})
  })
  test('hasVariable() should false when variable was never set', () => {
    const environment = new Environment()
    environment.set('foo', 'bar')
    expect(environment.hasVariable('baz')).toEqual(false)
  })
  test('hasVariable() should true when variable was set', () => {
    const environment = new Environment()
    environment.set('foo', 'bar')
    expect(environment.hasVariable('foo')).toEqual(true)
  })
  test('hasVariable() should true when variable was set to null', () => {
    const environment = new Environment()
    environment.set('foo', null)
    expect(environment.hasVariable('foo')).toEqual(true)
  })
})
