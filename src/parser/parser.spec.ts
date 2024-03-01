import { expect, test, describe } from 'vitest'
import { Lexer } from '../lexer/lexer'
import { Parser } from './parser'
import { Program, RequestStatement } from './ast'

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
})
