import { expect, test, describe } from 'vitest'
import { Token, TokenType } from './tokens'

describe('Tokens', () => {
    test('should create token from type and literal', () => {
      const token = new Token(TokenType.STRING, 'GET')
      expect(token.type).toEqual(TokenType.STRING)
      expect(token.literal).toEqual('GET')
    })
})
