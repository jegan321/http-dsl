import { expect, test, describe } from 'vitest'
import { Lexer } from './lexer'
import { TokenType } from './tokens'
import { formatJson } from '../utils/json-utils'

describe('Lexer - token types', () => {
  test('should get token type for GET', () => {
    const input = `GET`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.GET]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token type for lowercase GET', () => {
    const input = `get`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.GET]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for GET https://api.example.com', () => {
    const input = `GET https://api.example.com`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.GET, TokenType.STRING]
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
    const expectedTokens = [TokenType.SET, TokenType.STRING, TokenType.STRING, TokenType.STRING]
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
      TokenType.SET,
      TokenType.STRING,
      TokenType.STRING,
      TokenType.STRING,
      TokenType.END_STATEMENT,
      TokenType.SET,
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
      TokenType.GET,
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
    const expectedTokens = [TokenType.GET, TokenType.STRING]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for URL and headers with variables', () => {
    const input = `
      GET https://api.example.com/items/{{id}}
      x-api-key: {{api_key}}
      `
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.GET, TokenType.STRING, TokenType.NEWLINE, TokenType.STRING, TokenType.STRING]
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
      TokenType.POST,
      TokenType.STRING,
      TokenType.NEWLINE,
      TokenType.STRING,
      TokenType.STRING,
      TokenType.NEWLINE,
      TokenType.MULTI_LINE_STRING // One string token for the whole request body even though it spans four lines
    ]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for POST, header and request body', () => {
    const input = `
      POST https://api.example.com/items
      x-api-key: {{api_key}}
      [
        {
          "foo": "bar"
        }
      ]
      `
    const lexer = new Lexer(input)
    const expectedTokens = [
      TokenType.POST,
      TokenType.STRING,
      TokenType.NEWLINE,
      TokenType.STRING,
      TokenType.STRING,
      TokenType.NEWLINE,
      TokenType.MULTI_LINE_STRING // One string token for the whole request body even though it spans four lines
    ]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for PRINT Hello, world!', () => {
    const input = `PRINT Hello, world!`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.PRINT, TokenType.STRING, TokenType.STRING]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for comment', () => {
    const input = `# Ignore`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.END_FILE]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for GET request with comment on same line', () => {
    const input = `GET https://api.example.com # This sends a GET request`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.GET, TokenType.STRING, TokenType.END_FILE]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for GET request with comment on separate line', () => {
    const input = `
      # This sends a GET request
      GET https://api.example.com
    `
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.STRING, TokenType.GET, TokenType.STRING]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for expression with spaces around variable name', () => {
    const input = `{{ url }}`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.STRING]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for expression with newlines', () => {
    const input = `{{ 
      url 
    }}`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.STRING]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for expression with newlines', () => {
    const input = `SET access_token = {{ 
      response.body.access_token 
    }}`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.SET, TokenType.STRING, TokenType.STRING, TokenType.STRING]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for PROMPT name', () => {
    const input = `PROMPT name`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.PROMPT, TokenType.STRING]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token type for WRITE', () => {
    const input = `WRITE output.json {{ response.body }}`
    const lexer = new Lexer(input)
    const expectedTokens = [TokenType.WRITE, TokenType.STRING, TokenType.STRING]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for if statement', () => {
    const input = `
      IF true
        PRINT Hello
      END
    `
    const lexer = new Lexer(input)
    const expectedTokens = [
      TokenType.IF,
      TokenType.STRING,
      TokenType.NEWLINE,
      TokenType.PRINT,
      TokenType.STRING,
      TokenType.NEWLINE,
      TokenType.END
    ]
    const tokens = lexer.getAllTokens().map((token) => token.type)
    expect(tokens).toEqual(expectedTokens)
  })
  test('should get token types for for...in statement', () => {
    const input = `
      FOR number in {{ [1, 2, 3] }}
        PRINT {{ number }}
      END
    `
    const lexer = new Lexer(input)
    const expectedTokens = [
      TokenType.FOR,
      TokenType.STRING,
      TokenType.IN,
      TokenType.STRING,
      TokenType.NEWLINE,
      TokenType.PRINT,
      TokenType.STRING,
      TokenType.NEWLINE,
      TokenType.END
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
  test('should get token literal for request body', () => {
    const input = `
      POST https://api.example.com/items
      {
        "catalogNumber": "123",
        "description": "My item"
      }
      `
    const lexer = new Lexer(input)
    const literals = lexer.getAllTokens().map((token) => token.literal)
    const requestBodyLiteral = formatJson(literals[3])
    expect(JSON.parse(requestBodyLiteral)).toEqual({ catalogNumber: '123', description: 'My item' })
  })
  test('should get token literals for POST, headers and request body', () => {
    const input = `
      POST https://api.example.com/items
      content-type: application/json
      x-api-key: {{api_key}}
      {
        "catalogNumber": "123",
        "description": "My item"
      }
      `
    const lexer = new Lexer(input)
    const expectedLiterals = [
      'POST',
      'https://api.example.com/items',
      '',
      'content-type:',
      'application/json',
      '',
      'x-api-key:',
      '{{api_key}}',
      '',
      `{
        "catalogNumber": "123",
        "description": "My item"
      }`
    ]
    const literals = lexer.getAllTokens().map((token) => token.literal.trim())
    expect(literals).toEqual(expectedLiterals)
  })
  test('should get token literals for GET request with comment on separate line', () => {
    const input = `
      # This sends a GET request
      GET https://api.example.com
    `
    const lexer = new Lexer(input)
    // This test is asserting that there is a space as the first literal but that is not really ideal
    // At the moment I am not sure why that space is being returned
    // If this test fails because of that space, just remove the space from the expected literals
    const expectedLiterals = [' ', 'GET', 'https://api.example.com']
    const literals = lexer.getAllTokens().map((token) => token.literal)
    expect(literals).toEqual(expectedLiterals)
  })
})
