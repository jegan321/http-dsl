import { expect, test, describe } from 'vitest'
import { Lexer } from './lexer'
import { TokenType } from './tokens'

describe('Lexer', () => {
    test('should get token type for GET', () => {
      const input = `GET`
      const lexer = new Lexer(input)
      const expectedTokens = [TokenType.STRING]
      const tokens = lexer.getAllTokens().map(token => token.type)
      expect(tokens).toEqual(expectedTokens)
    })
    test('should get token types for GET https://api.example.com', () => {
      const input = `GET https://api.example.com`
      const lexer = new Lexer(input)
      const expectedTokens = [TokenType.STRING, TokenType.STRING]
      const tokens = lexer.getAllTokens().map(token => token.type)
      expect(tokens).toEqual(expectedTokens)
    })
    test('should get token types for SET id = 123', () => {
      const input = `SET id = 123`
      const lexer = new Lexer(input)
      const expectedTokens = [TokenType.STRING, TokenType.STRING, TokenType.ASSIGNMENT, TokenType.STRING]
      const tokens = lexer.getAllTokens().map(token => token.type)
      expect(tokens).toEqual(expectedTokens)
    })
})
