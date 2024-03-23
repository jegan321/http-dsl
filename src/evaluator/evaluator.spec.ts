import { expect, test, describe, beforeEach } from 'vitest'
import { MockInputOutput } from './input-output'
import { Environment } from './environment'
import { Evaluator } from './evaluator'
import { MockHttpClient } from './http-client'
import { Program, StatementType } from '../parser/ast'

describe('evaluate', async () => {
  const httpClient = new MockHttpClient()
  const io = new MockInputOutput()
  io.promptResponse = 'mocked_prompt_response'
  const environment = new Environment()
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
  })
  test('should send GET request with variable in URL', async () => {
    httpClient.status = 200
    httpClient.headers = { 'content-type': 'application/json' }
    httpClient.body = { message: 'Hello' }
    environment.variables.id = '999'
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
  })
  test('should send POST request where entire URL is an expressions', async () => {
    httpClient.status = 200
    httpClient.headers = { 'content-type': 'application/json' }
    httpClient.body = { message: 'Hello' }
    environment.variables.auth_url = 'https://api.example.com/login'
    const program = new Program([
      {
        type: StatementType.REQUEST,
        tokenLiteral: 'POST',
        method: 'POST',
        url: '{{auth_url}}',
        headers: {}
      }
    ])
    await evaluator.evaluate(program)
    expect(httpClient.sentRequests.length).toBe(1)
    expect(httpClient.sentRequests[0].url).toBe('https://api.example.com/login')
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
  test('should prompt then set variable', async () => {
    const program = new Program([
      {
        type: StatementType.PROMPT,
        tokenLiteral: 'PROMPT',
        variableName: 'message'
      }
    ])
    await evaluator.evaluate(program)
    expect(httpClient.sentRequests.length).toBe(0)
    expect(io.writes.length).toBe(1)
    expect(io.writes[0]).toBe(`Enter value for "message": `)
    expect(environment.variables.message).toBe('mocked_prompt_response')
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
  })
  test('should send request with host automatically prepended', async () => {
    httpClient.status = 200
    httpClient.headers = { 'content-type': 'application/json' }
    httpClient.body = { message: 'Hello' }
    const program = new Program([
      {
        type: StatementType.DEFAULT,
        tokenLiteral: 'DEFAULT',
        host: 'https://api.example.com'
      },
      {
        type: StatementType.REQUEST,
        tokenLiteral: 'GET',
        method: 'GET',
        url: '/items/123',
        headers: {}
      }
    ])
    await evaluator.evaluate(program)
    expect(httpClient.sentRequests.length).toBe(1)
    expect(httpClient.sentRequests[0].url).toBe('https://api.example.com/items/123')
  })
  test('should print hello world', async () => {
    const program = new Program([
      {
        type: StatementType.PRINT,
        tokenLiteral: 'PRINT',
        printValue: 'Hello, world!'
      }
    ])
    await evaluator.evaluate(program)
    expect(io.writes.length).toBe(1)
    expect(io.writes[0]).toBe('Hello, world!')
  })
  test('should set default header', async () => {
    const program = new Program([
      {
        type: StatementType.DEFAULT,
        tokenLiteral: 'DEFAULT',
        headerName: 'Accept',
        headerValue: 'application/json'
      },
      {
        type: StatementType.REQUEST,
        tokenLiteral: 'GET',
        method: 'GET',
        url: '/items/123',
        headers: {}
      }
    ])
    await evaluator.evaluate(program)
    expect(httpClient.sentRequests.length).toBe(1)
    expect(httpClient.sentRequests[0].url).toBe('http://localhost:8080/items/123')
    expect(httpClient.sentRequests[0].headers.Accept).toBe('application/json')
  })
  test('should write to file', async () => {
    const program = new Program([
      {
        type: StatementType.WRITE,
        tokenLiteral: 'DEFAULT',
        fileName: 'output.txt',
        content: 'Hello, world!'
      }
    ])
    await evaluator.evaluate(program)
    expect(io.fileWrites).toStrictEqual([{ fileName: 'output.txt', content: 'Hello, world!' }])
  })
})
