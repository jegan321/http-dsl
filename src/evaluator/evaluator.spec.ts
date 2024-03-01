import { expect, test, describe, beforeEach } from 'vitest'
import { MockInputOutput } from './input-output'
import { Environment } from './environment'
import { Evaluator } from './evaluator'
import { MockHttpClient } from './http-client'
import { Program, StatementType } from '../parser/ast'

describe('evaluate', async () => {
  const httpClient = new MockHttpClient()
  const io = new MockInputOutput()
  const environment = new Environment(() => Promise.resolve('unknown_value'))
  const evaluator = new Evaluator(environment, httpClient, io)
  beforeEach(() => {
    environment.reset()
    io.writes = []
    httpClient.sentRequests = []
  })
  test('should send GET request and print response', async () => {
    httpClient.status = 200
    httpClient.headers = { 'content-type': 'application/json' }
    httpClient.body = { message: 'Hello' }
    const program = new Program([
      {
        type: StatementType.REQUEST,
        tokenLiteral: 'GET',
        method: 'GET',
        url: 'https://api.example.com',
        headers: {}
      }
    ])
    await evaluator.evaluate(program)
    expect(httpClient.sentRequests.length).toBe(1)
    expect(io.writes[0]).toBe(200)
    expect(io.writes[1]).toBe(JSON.stringify({ message: 'Hello' }, null, 2))
  })
  test('should send GET request with variable in URL', async () => {
    httpClient.status = 200
    httpClient.headers = { 'content-type': 'application/json' }
    httpClient.body = { message: 'Hello' }
    environment.setVariable('id', '999')
    const program = new Program([
      {
        type: StatementType.REQUEST,
        tokenLiteral: 'GET',
        method: 'GET',
        url: 'https://api.example.com/items/{{id}}',
        headers: {}
      }
    ])
    await evaluator.evaluate(program)
    expect(httpClient.sentRequests.length).toBe(1)
    expect(httpClient.sentRequests[0].url).toBe('https://api.example.com/items/999')
    expect(io.writes[0]).toBe(200)
    expect(io.writes[1]).toBe(JSON.stringify({ message: 'Hello' }, null, 2))
  })
  test('should set variable in environment', async () => {
    const program = new Program([
      {
        type: StatementType.SET,
        tokenLiteral: 'SET',
        variableName: 'message',
        variableValue: 'Hello, world!'
      }
    ])
    await evaluator.evaluate(program)
    expect(httpClient.sentRequests.length).toBe(0)
    expect(io.writes.length).toBe(0)
    expect(environment.variables.message).toBe('Hello, world!')
  })
  test('should send set variable then send request', async () => {
    httpClient.status = 200
    httpClient.headers = { 'content-type': 'application/json' }
    httpClient.body = { message: 'Hello' }
    const program = new Program([
      {
        type: StatementType.SET,
        tokenLiteral: 'SET',
        variableName: 'id',
        variableValue: '999'
      },
      {
        type: StatementType.REQUEST,
        tokenLiteral: 'GET',
        method: 'GET',
        url: 'https://api.example.com/items/{{id}}',
        headers: {}
      }
    ])
    await evaluator.evaluate(program)
    expect(httpClient.sentRequests.length).toBe(1)
    expect(httpClient.sentRequests[0].url).toBe('https://api.example.com/items/999')
    expect(io.writes[0]).toBe(200)
    expect(io.writes[1]).toBe(JSON.stringify({ message: 'Hello' }, null, 2))
  })
})
