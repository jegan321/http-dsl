import { expect, test, describe } from 'vitest'
import { Lexer } from '../lexer/lexer'
import { Parser, concatenateUrlWithQueryParams } from './parser'
import {
  AssertStatement,
  DefaultStatement,
  ForStatement,
  IfStatement,
  PrintStatement,
  Program,
  PromptStatement,
  RequestStatement,
  SetStatement,
  WriteStatement
} from './ast'
import exp from 'constants'

function parseProgram(input: string): Program {
  const lexer = new Lexer(input)
  const parser = new Parser(lexer)
  const program = parser.parseProgram()
  expect(parser.errors, `Parser found ${parser.errors.length} errors`).toEqual([])
  return program
}

describe('Parser', () => {
  test('should parse GET https://api.example.com', () => {
    const input = `GET https://api.example.com`
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)
    const request = program.statements[0] as RequestStatement
    expect(request.type).toEqual('REQUEST')
    expect(request.tokenLiteral).toEqual('GET')
    expect(request.method).toEqual('GET')
    expect(request.url).toEqual('https://api.example.com')
  })
  test('should parse GET request with header', () => {
    const input = `
    GET https://api.example.com
    content-type: application/json
    `
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)
    const request = program.statements[0] as RequestStatement
    expect(request.type).toEqual('REQUEST')
    expect(request.tokenLiteral).toEqual('GET')
    expect(request.method).toEqual('GET')
    expect(request.url).toEqual('https://api.example.com')
    expect(Object.entries(request.headers).length).toEqual(1)
    expect(request.headers['content-type']).toEqual('application/json')
  })
  test('should parse GET request with query param', () => {
    const input = `
    GET https://api.example.com/search
    &q=My search terms
    `
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)
    const request = program.statements[0] as RequestStatement
    expect(request.type).toEqual('REQUEST')
    expect(request.tokenLiteral).toEqual('GET')
    expect(request.method).toEqual('GET')
    expect(request.url).toEqual('https://api.example.com/search?q=My+search+terms')
  })
  test('should parse GET request with query param and header', () => {
    const input = `
    GET https://api.example.com/search
    &q=My search terms
    content-type: application/json
    `
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)
    const request = program.statements[0] as RequestStatement
    expect(request.type).toEqual('REQUEST')
    expect(request.tokenLiteral).toEqual('GET')
    expect(request.method).toEqual('GET')
    expect(request.url).toEqual('https://api.example.com/search?q=My+search+terms')
    expect(Object.entries(request.headers).length).toEqual(1)
    expect(request.headers['content-type']).toEqual('application/json')
  })
  test('should parse GET request with two headers', () => {
    const input = `
    GET https://api.example.com
    content-type: application/json
    x-api-key: 123
    `
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)
    const request = program.statements[0] as RequestStatement
    expect(request.type).toEqual('REQUEST')
    expect(request.tokenLiteral).toEqual('GET')
    expect(request.method).toEqual('GET')
    expect(request.url).toEqual('https://api.example.com')
    expect(Object.entries(request.headers).length).toEqual(2)
    expect(request.headers['content-type']).toEqual('application/json')
    expect(request.headers['x-api-key']).toEqual('123')
  })
  test('should parse SET', () => {
    const input = `SET id = 123`
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)
    const request = program.statements[0] as SetStatement
    expect(request.type).toEqual('SET')
    expect(request.tokenLiteral).toEqual('SET')
    expect(request.variableName).toEqual('id')
    expect(request.variableValue).toEqual('123')
  })
  test('should parse SET with multiple word value', () => {
    const input = `SET id = Hello, world!`
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)
    const setStatement = program.statements[0] as SetStatement
    expect(setStatement.type).toEqual('SET')
    expect(setStatement.tokenLiteral).toEqual('SET')
    expect(setStatement.variableName).toEqual('id')
    expect(setStatement.variableValue).toEqual('Hello, world!')
  })
  test('should parse SET and DELETE', () => {
    const input = `
    SET id = 123

    DELETE https://api.example.com/{{id}}
    `
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(2)

    const setStatement = program.statements[0] as SetStatement
    expect(setStatement.type).toEqual('SET')
    expect(setStatement.tokenLiteral).toEqual('SET')
    expect(setStatement.variableName).toEqual('id')
    expect(setStatement.variableValue).toEqual('123')

    const requestStatement = program.statements[1] as RequestStatement
    expect(requestStatement.type).toEqual('REQUEST')
    expect(requestStatement.tokenLiteral).toEqual('DELETE')
    expect(requestStatement.url).toEqual('https://api.example.com/{{id}}')
  })
  test('should parse POST with header and body', () => {
    const input = `
    POST https://api.example.com/items
    content-type: application/json
    {
      "description": "My item"
    }
    `
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)

    const requestStatement = program.statements[0] as RequestStatement
    expect(requestStatement.type).toEqual('REQUEST')
    expect(requestStatement.tokenLiteral).toEqual('POST')
    expect(requestStatement.url).toEqual('https://api.example.com/items')
    expect(requestStatement.body).toEqual(`{
      "description": "My item"
    }`)
  })
  test('should parse POST with two headers and body', () => {
    const input = `
    POST https://api.example.com/items
    content-type: application/json
    x-api-key: {{api_key}}
    {
      "description": "My item"
    }
    `
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)

    const requestStatement = program.statements[0] as RequestStatement
    expect(requestStatement.type).toEqual('REQUEST')
    expect(requestStatement.tokenLiteral).toEqual('POST')
    expect(requestStatement.url).toEqual('https://api.example.com/items')
    expect(requestStatement.headers['content-type']).toEqual('application/json')
    expect(requestStatement.headers['x-api-key']).toEqual('{{api_key}}')
    expect(requestStatement.body).toEqual(`{
      "description": "My item"
    }`)
  })
  test('should parse PRINT Hello, world!', () => {
    const input = `PRINT Hello, world!`
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)
    const request = program.statements[0] as PrintStatement
    expect(request.type).toEqual('PRINT')
    expect(request.tokenLiteral).toEqual('PRINT')
    expect(request.printValue).toEqual('Hello, world!')
  })
  test('should parser PROMPT name', () => {
    const input = `PROMPT name`
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)
    const request = program.statements[0] as PromptStatement
    expect(request.type).toEqual('PROMPT')
    expect(request.tokenLiteral).toEqual('PROMPT')
    expect(request.variableName).toEqual('name')
  })
  test('should parse DEFAULT HOST https://api.example.com', () => {
    const input = `DEFAULT HOST https://api.example.com`
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)
    const request = program.statements[0] as DefaultStatement
    expect(request.type).toEqual('DEFAULT')
    expect(request.tokenLiteral).toEqual('DEFAULT')
    expect(request.host).toEqual('https://api.example.com')
  })
  test('should parse DEFAULT HEADER Accept = content-type/json', () => {
    const input = `DEFAULT HEADER Accept = content-type/json`
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)
    const request = program.statements[0] as DefaultStatement
    expect(request.type).toEqual('DEFAULT')
    expect(request.tokenLiteral).toEqual('DEFAULT')
    expect(request.headerName).toEqual('Accept')
    expect(request.headerValue).toEqual('content-type/json')
  })
  test('should parse default header and GET request', () => {
    const input = `
      DEFAULT HEADER Authentication = Basic xyz
      GET /v1/accounts/me
    `
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(2)
    const request = program.statements[0] as DefaultStatement
    expect(request.type).toEqual('DEFAULT')
    expect(request.tokenLiteral).toEqual('DEFAULT')
    expect(request.headerName).toEqual('Authentication')
    expect(request.headerValue).toEqual('Basic xyz')
  })
  test('should parse WRITE message.txt Hello', () => {
    const input = `WRITE message.txt Hello`
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)
    const request = program.statements[0] as WriteStatement
    expect(request.type).toEqual('WRITE')
    expect(request.tokenLiteral).toEqual('WRITE')
    expect(request.fileName).toEqual('message.txt')
    expect(request.content).toEqual('Hello')
  })
  test('should parse ASSERT true', () => {
    const input = `ASSERT true`
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)
    const request = program.statements[0] as AssertStatement
    expect(request.type).toEqual('ASSERT')
    expect(request.tokenLiteral).toEqual('ASSERT')
    expect(request.expression).toEqual('true')
    expect(request.failureMessage).toEqual('')
  })
  test('should parse if statement', () => {
    const input = `
      IF true
        PRINT Hello
        PRINT World
      END
    `
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)

    const IfStatement = program.statements[0] as IfStatement
    expect(IfStatement.type).toEqual('IF')
    expect(IfStatement.tokenLiteral).toEqual('IF')
    expect(IfStatement.lineNumber).toEqual(1)
    expect(IfStatement.condition).toEqual('true')
    expect(IfStatement.statements.length).toEqual(2)

    const printStatement = IfStatement.statements[0] as PrintStatement
    expect(printStatement.type).toEqual('PRINT')
    expect(printStatement.printValue).toEqual('Hello')

    const printStatement2 = IfStatement.statements[1] as PrintStatement
    expect(printStatement2.type).toEqual('PRINT')
    expect(printStatement2.printValue).toEqual('World')
  })
  test('should parse for...in statement', () => {
    const input = `
      FOR number IN {{ [1, 2, 3] }}
        PRINT {{ number }}
      END
    `
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)

    const IfStatement = program.statements[0] as ForStatement
    expect(IfStatement.type).toEqual('FOR')
    expect(IfStatement.tokenLiteral).toEqual('FOR')
    expect(IfStatement.lineNumber).toEqual(1)
    expect(IfStatement.variableName).toEqual('number')
    expect(IfStatement.iterable).toEqual('{{ [1, 2, 3] }}')
    expect(IfStatement.statements.length).toEqual(1)

    const printStatement = IfStatement.statements[0] as PrintStatement
    expect(printStatement.type).toEqual('PRINT')
    expect(printStatement.printValue).toEqual('{{ number }}')
  })
  test('should parse if statement inside for statement', () => {
    const input = `
      FOR number IN {{ [1, 2, 3] }}
        PRINT {{ number }}
        IF {{ number == 3 }}
          PRINT done
        END
      END
    `
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)

    const IfStatement = program.statements[0] as ForStatement
    expect(IfStatement.type).toEqual('FOR')
    expect(IfStatement.tokenLiteral).toEqual('FOR')
    expect(IfStatement.lineNumber).toEqual(1)
    expect(IfStatement.variableName).toEqual('number')
    expect(IfStatement.iterable).toEqual('{{ [1, 2, 3] }}')
    expect(IfStatement.statements.length).toEqual(1)

    const printStatement = IfStatement.statements[0] as PrintStatement
    expect(printStatement.type).toEqual('PRINT')
    expect(printStatement.printValue).toEqual('{{ number }}')
  })
})

describe('Passer errors', () => {
  test('should return error when input does not begin with valid command token', () => {
    const lexer = new Lexer('SEND /users')
    const parser = new Parser(lexer)
    parser.parseProgram()
    expect(parser.errors.length).toBeGreaterThan(0)
    expect(parser.errors[0].message).toBe('Invalid token at beginning of statement: SEND')
  })
  test('should return error when application/x-www-form-urlencoded request does not have JSON body', () => {
    const input = `
      POST /login
      content-type: application/x-www-form-urlencoded
      <body>
        <user>user1</user>
        <password>password1</password>
      </body>
    `
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    parser.parseProgram()
    expect(parser.errors.length).toBeGreaterThan(0)
    expect(parser.errors[0].message).toContain('Invalid JSON in body of application/x-www-form-urlencoded request')
  })
})

describe('concatenateUrlWithQueryParams', () => {
  test('should return url when there are no query params', () => {
    const url = 'https://api.example.com/users/search'
    const queryParams = {}
    const result = concatenateUrlWithQueryParams(url, queryParams)
    expect(result).toBe('https://api.example.com/users/search')
  })
  test('should append query param', () => {
    const url = 'https://api.example.com/users/search'
    const queryParams = {
      q: ['manager']
    }
    const result = concatenateUrlWithQueryParams(url, queryParams)
    expect(result).toBe('https://api.example.com/users/search?q=manager')
  })
  test('should append two query params', () => {
    const url = 'https://api.example.com/users/search'
    const queryParams = {
      q: ['manager'],
      size: ['10']
    }
    const result = concatenateUrlWithQueryParams(url, queryParams)
    expect(result).toBe('https://api.example.com/users/search?q=manager&size=10')
  })
  test('should append URL encode param', () => {
    const url = 'https://api.example.com/users/search'
    const queryParams = {
      q: ['My search terms'],
      size: ['10']
    }
    const result = concatenateUrlWithQueryParams(url, queryParams)
    expect(result).toBe('https://api.example.com/users/search?q=My+search+terms&size=10')
  })
  test('should parse form URL encoded POST request', () => {
    const input = `
    POST https://api.example.com/login
    content-type: application/x-www-form-urlencoded
    {
      "username": "user1",
      "password": "password1"
    }
    `
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)

    const requestStatement = program.statements[0] as RequestStatement
    expect(requestStatement.type).toEqual('REQUEST')
    expect(requestStatement.tokenLiteral).toEqual('POST')
    expect(requestStatement.url).toEqual('https://api.example.com/login')
    expect(requestStatement.headers['content-type']).toEqual('application/x-www-form-urlencoded')
    expect(requestStatement.formEncodedBody).toEqual({
      password: 'password1',
      username: 'user1'
    })
    expect(JSON.parse(requestStatement.body as string)).toEqual({
      password: 'password1',
      username: 'user1'
    })
  })
})
