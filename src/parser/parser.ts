import { Lexer } from '../lexer/lexer'
import { Token, TokenType } from '../lexer/tokens'
import { Command, Program, REQUEST_COMMANDS, RequestStatement, Statement, StatementType } from './ast'

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
    this.curToken = new Token(TokenType.END_FILE, '')
    this.peekToken = new Token(TokenType.END_FILE, '')

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
    while (this.curToken.type != TokenType.END_FILE) {
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

    if (REQUEST_COMMANDS.includes(command)) {
      return this.parseRequestStatement()
    } else {
      this.errors.push(`Unimplemented command: ${this.curToken.literal}`)
      return null
    }
  }

  curTokenIs(type: TokenType): boolean {
    return this.curToken.type === type
  }

  curTokenIsEndOfStatement(): boolean {
    return this.curTokenIs(TokenType.NEWLINE) || this.curTokenIs(TokenType.END_FILE)
  }

  peekTokenIs(type: TokenType): boolean {
    return this.peekToken.type === type
  }

  peekTokenIsEndOfStatement(): boolean {
    return this.peekTokenIs(TokenType.END_STATEMENT) || this.peekTokenIs(TokenType.END_FILE)
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

  parseRequestStatement(): RequestStatement {
    const commandLiteral = this.curToken.literal
    this.nextToken()
    const url = this.curToken.literal

    // this.expectPeek(TokenType.NEWLINE) // TODO: this was commented out because it failed if the next token is a EOF
    this.nextToken()

    const headers: Record<string, string> = {}
    if (!this.peekTokenIsEndOfStatement()) {
      this.expectPeek(TokenType.STRING)
      const headerName = this.curToken.literal.replace(':', '')
      this.expectPeek(TokenType.STRING)
      const headerValue = this.curToken.literal
      headers[headerName] = headerValue
    }

    return {
      type: StatementType.REQUEST,
      tokenLiteral: commandLiteral,
      method: commandLiteral,
      url,
      headers,
    }
  }

}