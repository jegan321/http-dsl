import { expect, test, describe } from 'vitest'
import { Lexer } from '../lexer/lexer'
import { Parser } from './parser'
import { Program } from './ast'

function parseProgram(input: string): Program {
  const lexer = new Lexer(input)
  const parser = new Parser(lexer)
  const program = parser.parseProgram()
  expect(parser.errors, `Parser found ${parser.errors.length} errors. First error: ${parser.errors[0]}`).toEqual([])
  return program
}

describe('Parser', () => {
  test('should parse program', () => {
    const input = `POST`
    const program = parseProgram(input)
    expect(program.statements.length).toEqual(1)
  })
})
