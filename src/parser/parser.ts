import { Lexer } from '../lexer/lexer'
import { Token, TokenType } from '../lexer/tokens'
import { Request } from './ast'

export function parseJson(input: string): Request[] {
  const parsedContent: Request | Request[] = JSON.parse(input)
  return !Array.isArray(parsedContent) ? [parsedContent] : parsedContent
}

export class Parser {
  private lexer: Lexer
  private curToken: Token
  private peekToken: Token
  errors: string[]

  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.errors = []

    // Start with EOF tokens to keep type-checker happy but really
    // they are set in nextToken() calls below
    this.curToken = new Token(TokenType.EOF, '')
    this.peekToken = new Token(TokenType.EOF, '')

    // Call nextToken twice to set curToken and peekToken
    this.nextToken()
    this.nextToken()
  }

  nextToken() {
    this.curToken = this.peekToken
    this.peekToken = this.lexer.nextToken()
  }

}