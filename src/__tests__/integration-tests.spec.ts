import { expect, test, describe, beforeEach } from 'vitest'
import { Lexer } from '../lexer/lexer'
import { Parser } from '../parser/parser'
import { Evaluator } from '../evaluator/evaluator'
import { MockHttpClient } from '../evaluator/http-client'
import { MockInputOutput } from '../evaluator/input-output'
import { Environment } from '../evaluator/environment'
import { format } from 'path'
import { formatJson } from '../utils/json-utils'

describe('Integration Tests', () => {
  const httpClient = new MockHttpClient()
  const io = new MockInputOutput()
  const environment = new Environment()
  const evaluator = new Evaluator(environment, httpClient, io)
  beforeEach(() => {
    io.writes = []
    httpClient.sentRequests = []
  })
  test('should send GET request', async () => {
    httpClient.status = 200
    httpClient.headers = { 'content-type': 'application/json' }
    httpClient.body = { message: 'Hello' }
    const input = `
        GET https://api.example.com/items
        content-type: application/json
      `
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()
    await evaluator.evaluate(program)
    expect(httpClient.sentRequests.length).toBe(1)
  })
  test('should send GET request with query params', async () => {
    httpClient.status = 200
    httpClient.headers = { 'content-type': 'application/json' }
    httpClient.body = { message: 'Hello' }
    const input = `
        GET https://api.example.com/users/search
        &q=My search terms
        &size=10
        content-type: application/json
      `
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()
    await evaluator.evaluate(program)
    expect(httpClient.sentRequests.length).toBe(1)
    expect(httpClient.sentRequests[0].url).toBe('https://api.example.com/users/search?q=My+search+terms&size=10')
  })
  test('should send POST request', async () => {
    httpClient.status = 200
    httpClient.headers = { 'content-type': 'application/json' }
    httpClient.body = { message: 'Hello' }
    const input = `
        POST https://api.example.com/items
        content-type: application/json
        { "description": "Item desc", "cataloNumber": "123" }
      `
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()
    await evaluator.evaluate(program)
    expect(httpClient.sentRequests.length).toBe(1)
    expect(httpClient.sentRequests[0].body).toBe(`{ "description": "Item desc", "cataloNumber": "123" }`)
  })
  test('should set variable and print it', async () => {
    const input = `
        SET foo = bar

        PRINT {{foo}}
      `
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()
    await evaluator.evaluate(program)
    expect(io.writes.length).toBe(1)
    expect(io.writes[0]).toBe('bar')
  })
})
