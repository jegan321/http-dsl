import { Lexer } from '../lexer/lexer'
import { COMMAND_TOKENS, Token, TokenType } from '../lexer/tokens'
import {
  Command,
  PrintStatement,
  Program,
  REQUEST_COMMANDS,
  RequestStatement,
  SetStatement,
  Statement,
  StatementType
} from './ast'

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
    if (!COMMAND_TOKENS.includes(this.curToken.type)) {
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
    } else if (command === Command.PRINT) {
      return this.parsePrintStatement()
    } else if (command === Command.SET) {
      return this.parseSetStatement()
    } else {
      this.errors.push(`Unimplemented command: ${this.curToken.literal}`)
      return null
    }
  }

  curTokenIs(type: TokenType): boolean {
    return this.curToken.type === type
  }

  curTokenIsEndOfStatement(): boolean {
    return this.curTokenIs(TokenType.END_STATEMENT) || this.curTokenIs(TokenType.END_FILE)
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
    // TODO: More clever way to convert string to enum?
    switch (this.curToken.type) {
      // Request commands
      case TokenType.GET:
        return Command.GET
      case TokenType.POST:
        return Command.POST
      case TokenType.PUT:
        return Command.PUT
      case TokenType.DELETE:
        return Command.DELETE

      // Other commands
      case TokenType.SET:
        return Command.SET
      case TokenType.PRINT:
        return Command.PRINT

      default:
        return null
    }
  }

  parseRequestStatement(): RequestStatement {
    const commandLiteral = this.curToken.literal
    this.nextToken() // Done with command

    const url = this.curToken.literal
    this.nextToken() // Done with URL

    const headers: Record<string, string> = {}
    let body: string | undefined = undefined

    // Now there will be a newline or end stmt or eof
    while (this.curTokenIs(TokenType.NEWLINE)) {
      // That means there is either a header or a body next

      this.nextToken() // Skip the newline

      if (this.curTokenIs(TokenType.STRING)) {
        // This is a header
        const headerName = this.curToken.literal.replace(':', '')
        this.nextToken() // Done with header name

        const headerValue = this.curToken.literal
        this.nextToken() // Done with header value

        headers[headerName] = headerValue
      } else if (this.curTokenIs(TokenType.MULTI_LINE_STRING)) {
        body = this.curToken.literal
        this.nextToken() // Done with body
        // break // Break out of the while loop because body is always last?
      }
    }

    return {
      type: StatementType.REQUEST,
      tokenLiteral: commandLiteral,
      method: commandLiteral,
      url,
      headers,
      body
    }
  }

  parsePrintStatement(): PrintStatement {
    const tokenLiteral = this.curToken.literal
    this.nextToken() // Done with PRINT token

    // TODO: This logic is the same as SetStatement and can be extracted
    let printValue = ''
    while (!this.curTokenIsEndOfStatement()) {
      if (printValue) {
        printValue += ' '
      }
      printValue += this.curToken.literal
      this.nextToken()
    }

    return {
      type: StatementType.PRINT,
      tokenLiteral,
      printValue
    }
  }

  parseSetStatement(): SetStatement {
    const tokenLiteral = this.curToken.literal
    this.nextToken()

    const variableName = this.curToken.literal
    this.nextToken()

    this.expectPeek(TokenType.STRING) // Skip over the '=' token

    let variableValue = ''
    while (!this.curTokenIsEndOfStatement()) {
      if (variableValue) {
        variableValue += ' '
      }
      variableValue += this.curToken.literal
      this.nextToken()
    }

    return {
      type: StatementType.SET,
      tokenLiteral,
      variableName,
      variableValue
    }
  }
}
