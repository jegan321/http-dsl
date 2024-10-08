import { expect, test, describe, beforeEach } from 'vitest'
import { Lexer } from './lexer/lexer'
import { Parser } from './parser/parser'
import { Evaluator } from './evaluator/evaluator'
import { MockHttpClient } from './evaluator/http-client'
import { MockInputOutput } from './evaluator/input-output'
import { Environment } from './evaluator/environment'

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
      environment.set('url', 'https://api.example.com/items')
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
    test('should send GET request when surrounded by comments', async () => {
      httpClient.status = 200
      httpClient.headers = { 'content-type': 'application/json' }
      httpClient.body = { message: 'Hello' }
      const input = `
          # This sends a GET request
          GET https://api.example.com/items
          content-type: application/json
          # GET request has been sent
        `
      const lexer = new Lexer(input)
      const parser = new Parser(lexer)
      const program = parser.parseProgram()
      await evaluator.evaluate(program)
      expect(httpClient.sentRequests.length).toBe(1)
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
      environment.set('roles', [
        { id: 1, name: 'Manager' },
        { id: 2, name: 'Admin' }
      ])
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
    test('should send POST request with Content-Type: application/x-www-form-urlencoded', async () => {
      httpClient.status = 200
      httpClient.headers = { 'content-type': 'application/json' }
      httpClient.body = { access_token: 'token' }
      const input = `
        POST /oauth2/token
        Content-Type: application/x-www-form-urlencoded
        Authorization: Basic MnJ2OHUydHFxY2ow
        {
          "grant_type": "client_credentials"
        }
      `
      const lexer = new Lexer(input)
      const parser = new Parser(lexer)
      const program = parser.parseProgram()
      await evaluator.evaluate(program)
      expect(httpClient.sentRequests.length).toBe(1)
    })
    test('should send POST request form body and variables', async () => {
      httpClient.status = 200
      httpClient.headers = { 'content-type': 'application/json' }
      httpClient.body = { access_token: 'token' }
      const input = `
        SET username = user1
        SET password = pass1

        POST /login
        Content-Type: application/x-www-form-urlencoded
        {
          "username": "{{ username }}",
          "password": "{{password}}"
        }
      `
      const lexer = new Lexer(input)
      const parser = new Parser(lexer)
      const program = parser.parseProgram()
      await evaluator.evaluate(program)
      expect(httpClient.sentRequests.length).toBe(1)
      expect(httpClient.sentRequests[0].body).toBe(`username=user1&password=pass1`)
    })
    test('should send GET request with default host and default headers', async () => {
      httpClient.status = 200
      httpClient.headers = { 'content-type': 'application/json' }
      httpClient.body = { message: 'Hello' }
      const input = `
          DEFAULT HOST https://api.example.com
          DEFAULT HEADER Accept = application/json
          DEFAULT HEADER Authorization = Bearer 123
          GET /items
          Content-Type: application/json
        `
      const lexer = new Lexer(input)
      const parser = new Parser(lexer)
      const program = parser.parseProgram()
      await evaluator.evaluate(program)
      expect(httpClient.sentRequests.length).toBe(1)
      expect(httpClient.sentRequests[0].url).toBe('https://api.example.com/items')
      expect(httpClient.sentRequests[0].headers['Accept']).toBe('application/json')
      expect(httpClient.sentRequests[0].headers['Content-Type']).toBe('application/json')
      expect(httpClient.sentRequests[0].headers['Authorization']).toBe('Bearer 123')
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
    test('should send GET request and print response with two blank lines between', async () => {
      httpClient.status = 200
      httpClient.headers = { 'content-type': 'application/json' }
      httpClient.body = { message: 'Hello' }
      const input = `
          GET https://api.example.com/items


          PRINT {{ response }}
        `
      const lexer = new Lexer(input)
      const parser = new Parser(lexer)
      const program = parser.parseProgram()
      await evaluator.evaluate(program)
      expect(httpClient.sentRequests.length).toBe(1)
    })
  })

  describe('Expressions', () => {
    test('should print expression containing newlines', async () => {
      const input = `
          SET message = {{ 'Hello world' }}
          SET transformed_message = {{ 
            message
              .toUpperCase()
              .split(' ')[0] 
          }}
          PRINT {{ transformed_message }}
        `
      const lexer = new Lexer(input)
      const parser = new Parser(lexer)
      const program = parser.parseProgram()
      await evaluator.evaluate(program)
      expect(io.writes.length).toBe(1)
      expect(io.writes[0]).toBe('HELLO')
    })
    test('should set variable to array literal', async () => {
      const input = `
        SET numbers = {{ [1, 2, 3] }}
      `
      const lexer = new Lexer(input)
      const parser = new Parser(lexer)
      const program = parser.parseProgram()
      await evaluator.evaluate(program)
      expect(environment.get('numbers')).toEqual([1, 2, 3])
      expect(environment.get('numbers').length).toBe(3)
      expect(environment.get('numbers')[0]).toBe(1)
    })
    test('should print object literal and array literal', async () => {
      const input = `
        SET obj = {{ 
          { 
            key: "value" 
          } 
        }}
        SET numbers = {{ [1, 2, 3] }}
        PRINT {{ obj }}
        PRINT {{ numbers }}
      `
      const lexer = new Lexer(input)
      const parser = new Parser(lexer)
      const program = parser.parseProgram()
      await evaluator.evaluate(program)
      expect(io.writes.length).toBe(2)
      expect(io.writes[0]).toBe(`{"key":"value"}`)
      expect(io.writes[1]).toBe(`[1,2,3]`)
    })
  })

  describe('Loops', () => {
    test('should print numbers in a loop', async () => {
      const input = `
          FOR number IN {{ [1, 2, 3] }}
            PRINT {{ number }}
          END
        `
      const lexer = new Lexer(input)
      const parser = new Parser(lexer)
      const program = parser.parseProgram()
      await evaluator.evaluate(program)
      expect(io.writes.length).toBe(3)
      expect(io.writes[0]).toBe('1')
      expect(io.writes[1]).toBe('2')
      expect(io.writes[2]).toBe('3')
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
    test('should base64 dencode', async () => {
      const input = `
          SET encoded = dXNlcjE6cGFzc3dvcmQx

          PRINT {{ base64Decode(encoded) }}
        `
      const lexer = new Lexer(input)
      const parser = new Parser(lexer)
      const program = parser.parseProgram()
      await evaluator.evaluate(program)
      expect(io.writes.length).toBe(1)
      expect(io.writes[0]).toBe('user1:password1')
    })
  })
})
