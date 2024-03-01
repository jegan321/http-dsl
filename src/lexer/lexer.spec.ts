import { expect, test, describe } from 'vitest'
import { Lexer } from './lexer'
import { TokenType } from './tokens'

describe('Lexer - token types', () => {
  test('should get token type for GET', () => {
    const input = `GET`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.STRING]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for GET https://api.example.com', () => {
    const input = `GET https://api.example.com`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.STRING, TokenType.STRING]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for word surrounded by newlines', () => {
    const input = `
        foo
      `
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.STRING]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for SET id = 123', () => {
    const input = `SET id = 123`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.STRING, TokenType.STRING, TokenType.STRING, TokenType.STRING]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for two setters', () => {
    const input = `
        SET id = 123

        SET type = foo
      `
    const lexer = new Lexer(input)
    const expectedTokens = [
      TokenType.STRING,
      TokenType.STRING,
      TokenType.STRING,
      TokenType.STRING,
      TokenType.END_STATEMENT,
      TokenType.STRING,
      TokenType.STRING,
      TokenType.STRING,
      TokenType.STRING
    ]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for Content-Type: application/json', () => {
    const input = `Content-Type: application/json`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.STRING, TokenType.STRING]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for request line and headers', () => {
    const input = `
        GET https://api.example.com
        Content-Type: application/json
        x-api-key: 123
      `
    const lexer = new Lexer(input)
    const expectedTokens = [
      TokenType.STRING,
      TokenType.STRING,
      TokenType.NEWLINE,
      TokenType.STRING,
      TokenType.STRING,
      TokenType.NEWLINE,
      TokenType.STRING,
      TokenType.STRING
    ]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for URL with variable', () => {
    const input = `GET https://api.example.com/items/{{id}}`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.STRING, TokenType.STRING]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for URL and headers with variables', () => {
    const input = `
      GET https://api.example.com/items/{{id}}
      x-api-key: {{api_key}}
      `
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.STRING, TokenType.STRING, TokenType.NEWLINE, TokenType.STRING, TokenType.STRING]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for POST, header and request body', () => {
    const input = `
      POST https://api.example.com/items
      x-api-key: {{api_key}}
      {
        "catalogNumber": "123",
        "description": "My item"
      }
      `
    const lexer = new Lexer(input)
    const expectedTokens = [
      TokenType.STRING, TokenType.STRING, TokenType.NEWLINE, 
      TokenType.STRING, TokenType.STRING, TokenType.NEWLINE,
      TokenType.MULTI_LINE_STRING, // One string token for the whole request body even though it spans four lines
    ]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
})

describe('Lexer - token literals', () => {
  test('should get token literals for GET', () => {
    const input = `GET`
    const lexer = new Lexer(input)
    const expectedLiterals = ['GET']
    const literals = lexer.getAllTokens().map((token) => token.literal)
    expect(literals).toEqual(expectedLiterals)
  })
  test('should get token literals for GET https://api.example.com', () => {
    const input = `GET https://api.example.com`
    const lexer = new Lexer(input)
    const expectedLiterals = ['GET', 'https://api.example.com']
    const literals = lexer.getAllTokens().map((token) => token.literal)
    expect(literals).toEqual(expectedLiterals)
  })
  test('should get token literals for SET id = 123', () => {
    const input = `SET id = 123`
    const lexer = new Lexer(input)
    const expectedLiterals = ['SET', 'id', '=', '123']
    const literals = lexer.getAllTokens().map((token) => token.literal)
    expect(literals).toEqual(expectedLiterals)
  })
  test('should get token literals for POST, header and request body', () => {
    const input = `
      POST https://api.example.com/items
      {
        "catalogNumber": "123",
        "description": "My item"
      }
      `
    const lexer = new Lexer(input)
    const literals = lexer.getAllTokens().map((token) => token.literal)
    const requestBodyLiteral = JSON.stringify(JSON.parse(literals[3]))
    expect(requestBodyLiteral).toEqual(`{"catalogNumber":"123","description":"My item"}`)
  })
})
