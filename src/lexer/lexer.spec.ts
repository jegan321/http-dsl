import { expect, test, describe } from 'vitest'
import { Lexer } from './lexer'
import { TokenType } from './tokens'

describe('Lexer', async () => {
    test('should get token types for assignments', () => {
      const input = `GET`
      const lexer = new Lexer(input)
      const expectedTokens = [TokenType.GET]
      const tokens = []
      while (tokens.length < expectedTokens.length) {
        tokens.push(lexer.nextToken().type)
      }
      expect(tokens).toEqual(expectedTokens)
    })
})
