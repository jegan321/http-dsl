import { expect, test, describe } from 'vitest'
import { Lexer } from '../lexer/lexer'
import { Parser, concatenateUrlWithQueryParams } from './parser'
import { PrintStatement, Program, RequestStatement, SetStatement } from './ast'

function parseProgram(input: string): Program {
  const lexer = new Lexer(input)
  const parser = new Parser(lexer)
  const program = parser.parseProgram()
  expect(parser.errors, `Parser found ${parser.errors.length} errors. First error: ${parser.errors[0]}`).toEqual([])
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
      q: 'manager'
    }
    const result = concatenateUrlWithQueryParams(url, queryParams)
    expect(result).toBe('https://api.example.com/users/search?q=manager')
  })
  test('should append two query params', () => {
    const url = 'https://api.example.com/users/search'
    const queryParams = {
      q: 'manager',
      size: '10'
    }
    const result = concatenateUrlWithQueryParams(url, queryParams)
    expect(result).toBe('https://api.example.com/users/search?q=manager&size=10')
  })
  test('should append URL encode param', () => {
    const url = 'https://api.example.com/users/search'
    const queryParams = {
      q: 'My search terms',
      size: '10'
    }
    const result = concatenateUrlWithQueryParams(url, queryParams)
    expect(result).toBe('https://api.example.com/users/search?q=My+search+terms&size=10')
  })
})