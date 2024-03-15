import { expect, test, describe, beforeEach } from 'vitest'
import { Lexer } from '../lexer/lexer'
import { Parser } from '../parser/parser'
import { Evaluator } from '../evaluator/evaluator'
import { MockHttpClient } from '../evaluator/http-client'
import { MockInputOutput } from '../evaluator/input-output'
import { Environment } from '../evaluator/environment'

describe('Integration tests', () => {
  const httpClient = new MockHttpClient()
  const io = new MockInputOutput()
  const environment = new Environment()
  const evaluator = new Evaluator(environment, httpClient, io)

  beforeEach(() => {
    io.writes = []
    httpClient.sentRequests = []
  })

  describe('HTTP requests', () => {
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
    test('should send GET request with the entire URl as a variable', async () => {
      httpClient.status = 200
      httpClient.headers = { 'content-type': 'application/json' }
      httpClient.body = { message: 'Hello' }
      environment.variables.url = 'https://api.example.com/items'
      const input = `
          GET {{ url }}
          content-type: application/json
        `
      const lexer = new Lexer(input)
      const parser = new Parser(lexer)
      const program = parser.parseProgram()
      await evaluator.evaluate(program)
      expect(httpClient.sentRequests.length).toBe(1)
      expect(httpClient.sentRequests[0].url).toBe('https://api.example.com/items')
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
    test('should send GET request with duplicate query params', async () => {
      httpClient.status = 200
      httpClient.headers = { 'content-type': 'application/json' }
      httpClient.body = { message: 'Hello' }
      const input = `
          GET https://api.example.com/users/search
          &column=Name
          &column=Type
          &column=Created Date
          content-type: application/json
        `
      const lexer = new Lexer(input)
      const parser = new Parser(lexer)
      const program = parser.parseProgram()
      await evaluator.evaluate(program)
      expect(httpClient.sentRequests.length).toBe(1)
      expect(httpClient.sentRequests[0].url).toBe(
        'https://api.example.com/users/search?column=Name&column=Type&column=Created+Date'
      )
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
    test('should send POST request with array mapped variable', async () => {
      httpClient.status = 200
      httpClient.headers = { 'content-type': 'application/json' }
      httpClient.body = { message: 'Hello' }
      environment.variables.roles = [
        { id: 1, name: 'Manager' },
        { id: 2, name: 'Admin' }
      ]
      const input = `
        POST https://api.example.com/users
        content-type: application/json
        {
          "username": "user1",
          "roleIds": {{ roles.map(role => role.id) }}
        }
      `
      const lexer = new Lexer(input)
      const parser = new Parser(lexer)
      const program = parser.parseProgram()
      await evaluator.evaluate(program)
      expect(httpClient.sentRequests.length).toBe(1)
      expect(JSON.parse(httpClient.sentRequests[0].body as string)).toEqual({
        username: 'user1',
        roleIds: [1, 2]
      })
    })
  })

  describe('Printing', () => {
    test('should print newline', async () => {
      const input = `PRINT`
      const lexer = new Lexer(input)
      const parser = new Parser(lexer)
      const program = parser.parseProgram()
      await evaluator.evaluate(program)
      expect(io.writes.length).toBe(1)
      expect(io.writes[0]).toBe('')
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

  describe('Helpers', () => {
    test('should base64 encode', async () => {
      const input = `
          SET credentials = user1:password1

          PRINT {{ base64(credentials) }}
        `
      const lexer = new Lexer(input)
      const parser = new Parser(lexer)
      const program = parser.parseProgram()
      await evaluator.evaluate(program)
      expect(io.writes.length).toBe(1)
      expect(io.writes[0]).toBe('dXNlcjE6cGFzc3dvcmQx')
    })
  })

})
