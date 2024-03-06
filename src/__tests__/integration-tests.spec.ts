import { expect, test, describe, beforeEach } from 'vitest'
import { Lexer } from '../lexer/lexer'
import { Parser } from '../parser/parser'
import { Evaluator } from '../evaluator/evaluator'
import { MockHttpClient } from '../evaluator/http-client'
import { MockInputOutput } from '../evaluator/input-output'
import { Environment } from '../evaluator/environment'

describe('Integration Tests', () => {
  const httpClient = new MockHttpClient()
  const io = new MockInputOutput()
  const environment = new Environment()
  const evaluator = new Evaluator(environment, httpClient, io)
  beforeEach(() => {
    io.writes = []
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
    expect(io.writes[0]).toBe(200)
    expect(io.writes[1]).toBe(JSON.stringify({ message: 'Hello' }, null, 2))
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
