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
})
