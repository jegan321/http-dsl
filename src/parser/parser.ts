import { Lexer } from '../lexer/lexer'
import { Token, TokenType } from '../lexer/tokens'
import { Command, Program, Statement, StatementType } from './ast'

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

  parseProgram(): Program {
    const statements: Statement[] = []
    while (this.curToken.type != TokenType.EOF) {
      const statement = this.parseStatement()
      if (statement != null) {
        statements.push(statement)
      }
      this.nextToken()
    }
    return new Program(statements)
  }

  parseStatement(): Statement | null {
    if (!this.curTokenIs(TokenType.STRING)) {
      this.errors.push(`Invalid token at beginning of statement: ${this.curToken.literal}`)
      return null
    }

    const command = this.getCommand()
    if (command == null) {
      this.errors.push(`Invalid command: ${this.curToken.literal}`)
      return null
    }

    return {
      type: StatementType.REQUEST,
      tokenLiteral: this.curToken.literal,
    }
  }

  curTokenIs(type: TokenType): boolean {
    return this.curToken.type === type
  }

  curTokenIsEndOfStatement(): boolean {
    return this.curTokenIs(TokenType.NEWLINE) || this.curTokenIs(TokenType.EOF)
  }

  peekTokenIs(type: TokenType): boolean {
    return this.peekToken.type === type
  }

  peekTokenIsEndOfStatement(): boolean {
    return this.peekTokenIs(TokenType.NEWLINE) || this.peekTokenIs(TokenType.EOF)
  }

  expectPeek(type: TokenType): boolean {
    if (this.peekTokenIs(type)) {
      this.nextToken()
      return true
    } else {
      this.errors.push(`Expected next token to be a ${type}, got ${this.peekToken.type} instead`)
      return false
    }
  }

  getCommand(): Command | null {
    switch (this.curToken.literal) {
      case 'GET':
        return Command.GET
      case 'POST':
        return Command.POST
      case 'PUT':
        return Command.PUT
      case 'DELETE':
        return Command.DELETE
      default:
        return null
    }
  }

}