import { expect, test, describe, beforeEach } from 'vitest'
import { MockInputOutput } from './input-output'
import { Environment } from './environment'
import { Evaluator } from './evaluator'
import { MockHttpClient } from './http-client'
import { Program, StatementType } from '../parser/ast'

describe('evaluate', async () => {
  const httpClient = new MockHttpClient()
  const io = new MockInputOutput()
  const environment = new Environment(() => Promise.resolve('mock_value'))
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
        url: 'https://api.example.com'
      }
    ])
    await evaluator.evaluate(program)
    expect(httpClient.sentRequests.length).toBe(1)
    expect(io.writes[0]).toBe(200)
    expect(io.writes[1]).toBe(JSON.stringify({ message: 'Hello' }, null, 2))
  })
})
