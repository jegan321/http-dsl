import { Lexer } from '../lexer/lexer'
import { COMMAND_TOKENS, REQUEST_TOKENS, Token, TokenType } from '../lexer/tokens'
import { isContentType } from '../utils/header-utils'
import { Logger } from '../utils/logger'
import {
  AssertStatement,
  DefaultStatement,
  ForStatement,
  IfStatement,
  PrintStatement,
  Program,
  PromptStatement,
  RequestStatement,
  SetStatement,
  Statement,
  StatementType,
  TestStatement,
  WriteStatement
} from './ast'

export class SyntaxError {
  lineNumber: number
  message: string
  constructor(lineNumber: number, message: string) {
    this.lineNumber = lineNumber
    this.message = message
  }
}

export class Parser {
  private lexer: Lexer
  private log: Logger
  private curToken: Token
  private peekToken: Token
  errors: SyntaxError[]

  constructor(lexer: Lexer, logger: Logger = new Logger()) {
    this.lexer = lexer
    this.log = logger
    this.errors = []

    // Start with BEGIN_FILE tokens to keep type-checker happy but really
    // they are set in nextToken() calls below
    this.curToken = new Token(TokenType.BEGIN_FILE, '', 0)
    this.peekToken = new Token(TokenType.BEGIN_FILE, '', 0)

    // Call nextToken twice to set curToken and peekToken
    this.nextToken()
    this.nextToken()
  }

  nextToken() {
    this.curToken = this.peekToken
    this.peekToken = this.lexer.nextToken()
    this.log.debug(`curToken=${this.curToken.type}, peekToken=${this.peekToken.type}`)
  }

  parseProgram(): Program {
    const statements: Statement[] = []
    while (this.curToken.type != TokenType.END_FILE) {
      const statement = this.parseStatement()
      if (statement != null) {
        statements.push(statement)
      }
      this.nextToken()
      this.skipWhiteSpaceTokens()
    }
    return new Program(statements)
  }

  skipWhiteSpaceTokens() {
    const whiteSpaceTokens = [TokenType.NEWLINE, TokenType.END_STATEMENT]
    while (whiteSpaceTokens.includes(this.curToken.type)) {
      this.nextToken()
    }
  }

  parseStatement(): Statement | null {
    if (!COMMAND_TOKENS.includes(this.curToken.type)) {
      this.addSyntaxError(this.curToken, `Invalid ${this.curToken.type} token at beginning of statement: ${this.curToken.literal}`)
      return null
    }

    // this.log.debug(`parseStatement() ${this.curToken.type}`)

    if (REQUEST_TOKENS.includes(this.curToken.type)) {
      return this.parseRequestStatement()
    } else if (this.curToken.type === TokenType.PRINT) {
      return this.parsePrintStatement()
    } else if (this.curToken.type === TokenType.SET) {
      return this.parseSetStatement()
    } else if (this.curToken.type === TokenType.PROMPT) {
      return this.parsePromptStatement()
    } else if (this.curToken.type === TokenType.DEFAULT) {
      return this.parseDefaultStatement()
    } else if (this.curToken.type === TokenType.WRITE) {
      return this.parseWriteStatement()
    } else if (this.curToken.type === TokenType.TEST) {
      return this.parseTestStatement()
    } else if (this.curToken.type === TokenType.ASSERT) {
      return this.parseAssertStatement()
    } else if (this.curToken.type === TokenType.IF) {
      return this.parseIfStatement()
    } else if (this.curToken.type === TokenType.FOR) {
      return this.parseForStatement()
    } else {
      this.addSyntaxError(this.curToken, `Unimplemented command: ${this.curToken.literal}`)
      return null
    }
  }

  curTokenIs(type: TokenType): boolean {
    return this.curToken.type === type
  }

  curTokenIsEndOfStatement(): boolean {
    return this.curTokenIs(TokenType.END_STATEMENT) || this.curTokenIs(TokenType.END_FILE)
  }

  curTokenIsEndOfLine(): boolean {
    return this.curTokenIsEndOfStatement() || this.curTokenIs(TokenType.NEWLINE)
  }

  peekTokenIs(type: TokenType): boolean {
    return this.peekToken.type === type
  }

  peekTokenIsEndOfStatement(): boolean {
    return this.peekTokenIs(TokenType.END_STATEMENT) || this.peekTokenIs(TokenType.END_FILE)
  }

  expectCurrent(type: TokenType): boolean {
    if (this.curTokenIs(type)) {
      this.nextToken()
      return true
    } else {
      this.addSyntaxError(this.curToken, `Expected current token to be a ${type}, got ${this.curToken.type} instead with value: ${this.curToken.literal}`)
      return false
    }
  }

  /**
   * Assert current token is the given type and move to the next token
   */
  expectCurrentIsAnyOf(types: TokenType[]): boolean {
    if (types.includes(this.curToken.type)) {
      this.nextToken()
      return true
    } else {
      this.addSyntaxError(
        this.curToken,
        `Expected current token to be one of ${types.join(', ')}, got ${this.curToken.type} instead with value: ${this.curToken.literal}`
      )
      return false
    }
  }

  expectPeek(type: TokenType): boolean {
    if (this.peekTokenIs(type)) {
      this.nextToken()
      return true
    } else {
      this.addSyntaxError(this.curToken, `Expected next token to be a ${type}, got ${this.peekToken.type} instead with value: ${this.peekToken.literal}`)
      return false
    }
  }

  parseRequestStatement(): RequestStatement {
    const lineNumber = this.curToken.lineNumber

    const commandLiteral = this.curToken.literal
    this.nextToken() // Done with command

    const url = this.curToken.literal
    this.nextToken() // Done with URL

    const headers: Record<string, string> = {}
    const queryParams: Record<string, string[]> = {}
    let body: string | undefined = undefined
    let formEncodedBody: Record<string, string> | undefined = undefined

    // Now there will be a newline or end stmt or eof
    while (this.curTokenIs(TokenType.NEWLINE)) {
      // That means there is either a header, query param or a body next

      this.nextToken() // Skip the newline

      if (this.curTokenIs(TokenType.STRING)) {
        if (this.curToken.literal.startsWith('&')) {
          // This is a query param
          const queryParamLine = this.parseRestOfLineAsSingleString()
          const queryNameAndValue = queryParamLine.substring(1) // Skip the &
          const elements = queryNameAndValue.split('=')
          const queryParamName = elements[0]
          const queryParamValue = elements.length > 1 ? elements[1] : ''
          if (queryParams[queryParamName] == null) {
            queryParams[queryParamName] = []
          }
          queryParams[queryParamName].push(queryParamValue)

          // this.nextToken() // Don't call nextToken() because parseRestOfLineAsSingleString() already skips to the newline token
        } else {
          // This is a header
          const headerName = this.curToken.literal.replace(':', '')
          this.nextToken() // Done with header name

          const headerValue = this.parseRestOfLineAsSingleString() // Done with header value

          headers[headerName] = headerValue
        }
      } else if (this.curTokenIs(TokenType.MULTI_LINE_STRING)) {
        body = this.curToken.literal
        this.nextToken() // Done with body
        // break // Break out of the while loop because body is always last?
      }
    }

    /*
      For form-urlencoded requests, the user writes the body using JSON syntax and the 
      parser automatically converts it into an encoded string.
      For example:
      {
        "username": "user1",
        "password": "password1"
      }
      Is converted to:
      username=user1&password=password1

      However, the parser stores it in the AST as an object. It is not turned into an encoded string until evaluation.
    */
    if (isContentType('application/x-www-form-urlencoded', headers) && body != null) {
      try {
        formEncodedBody = JSON.parse(body)
      } catch (error) {
        this.addSyntaxError(this.curToken, `Invalid JSON in body of application/x-www-form-urlencoded request: ${body}`)
      }
    }

    return {
      type: StatementType.REQUEST,
      tokenLiteral: commandLiteral,
      lineNumber,
      method: commandLiteral,
      url: concatenateUrlWithQueryParams(url, queryParams),
      headers,
      body,
      formEncodedBody
    }
  }

  parseRestOfLineAsSingleString(): string {
    let value = ''
    while (!this.curTokenIsEndOfLine()) {
      if (value) {
        value += ' '
      }
      value += this.curToken.literal
      this.nextToken()
    }
    return value
  }

  parsePrintStatement(): PrintStatement {
    const lineNumber = this.curToken.lineNumber

    const tokenLiteral = this.curToken.literal
    this.nextToken() // Done with PRINT token

    const printValue = this.parseRestOfLineAsSingleString()

    return {
      type: StatementType.PRINT,
      tokenLiteral,
      lineNumber,
      printValue
    }
  }

  parseSetStatement(): SetStatement {
    const lineNumber = this.curToken.lineNumber

    const tokenLiteral = this.curToken.literal
    this.nextToken()

    const variableName = this.curToken.literal
    this.nextToken()

    this.expectPeek(TokenType.STRING) // Skip over the '=' token

    const variableValue = this.parseRestOfLineAsSingleString()

    return {
      type: StatementType.SET,
      tokenLiteral,
      lineNumber,
      variableName,
      variableValue
    }
  }

  parsePromptStatement(): PromptStatement {
    const tokenLiteral = this.curToken.literal
    this.nextToken()

    const variableName = this.curToken.literal
    this.nextToken()

    // TODO: Add parser error if there are two strings after PROMPT

    return {
      type: StatementType.PROMPT,
      tokenLiteral,
      variableName
    }
  }

  parseDefaultStatement(): DefaultStatement {
    const lineNumber = this.curToken.lineNumber

    const tokenLiteral = this.curToken.literal
    this.nextToken()

    let host: string | undefined = undefined
    let headerName: string | undefined = undefined
    let headerValue: string | undefined = undefined

    const subType = this.curToken.literal.toUpperCase()
    this.nextToken()
    if (subType === 'HOST') {
      host = this.curToken.literal // TODO: Validate host starts with http or something
      this.nextToken()
    } else if (subType === 'HEADER') {
      headerName = this.curToken.literal
      this.nextToken()
      this.expectPeek(TokenType.STRING) // Skip over the '=' token
      headerValue = this.parseRestOfLineAsSingleString()
    } else {
      this.addSyntaxError(this.curToken, `Invalid token after DEFAULT command: ${subType}`)
    }

    return {
      type: StatementType.DEFAULT,
      tokenLiteral,
      lineNumber,
      host,
      headerName,
      headerValue
    }
  }

  parseWriteStatement(): WriteStatement {
    const lineNumber = this.curToken.lineNumber

    const tokenLiteral = this.curToken.literal
    this.nextToken()

    const fileName = this.curToken.literal
    this.nextToken() // Done with file name

    const content = this.parseRestOfLineAsSingleString()

    return {
      type: StatementType.WRITE,
      tokenLiteral,
      lineNumber,
      fileName,
      content
    }
  }

  parseTestStatement(): TestStatement {
    const lineNumber = this.curToken.lineNumber

    const tokenLiteral = this.curToken.literal
    this.nextToken() // Done with TEST token

    return {
      type: StatementType.TEST,
      tokenLiteral,
      lineNumber
    }
  }

  parseAssertStatement(): AssertStatement {
    const lineNumber = this.curToken.lineNumber

    const tokenLiteral = this.curToken.literal
    this.nextToken() // Done with ASSERT token

    const expression = this.curToken.literal
    this.nextToken() // Done with expression

    const failureMessage = this.parseRestOfLineAsSingleString()

    return {
      type: StatementType.ASSERT,
      tokenLiteral,
      lineNumber,
      expression,
      failureMessage
    }
  }

  parseIfStatement(): IfStatement {
    const lineNumber = this.curToken.lineNumber

    const tokenLiteral = this.curToken.literal
    this.nextToken() // Done with IF token

    const condition = this.curToken.literal
    this.nextToken() // Done with condition

    // Skip over new line/end statement
    this.expectCurrentIsAnyOf([TokenType.NEWLINE, TokenType.END_STATEMENT])

    const statements = this.parseBlock()

    return {
      type: StatementType.IF,
      tokenLiteral,
      lineNumber,
      condition,
      statements
    }
  }

  /**
   * Parses statements recursively until an END token is found
   * TODO: Document which token will it be on after this returns
   */
  parseBlock(): Statement[] {
    const statements: Statement[] = []
    while (!this.curTokenIs(TokenType.END)) {
      const statement = this.parseStatement()
      if (statement != null) {
        statements.push(statement)
      }
      this.nextToken()
      this.skipWhiteSpaceTokens()
    }
    return statements
  }

  parseForStatement(): ForStatement {
    const lineNumber = this.curToken.lineNumber

    const tokenLiteral = this.curToken.literal
    this.nextToken() // Done with FOR token

    const variableName = this.curToken.literal
    this.nextToken() // Done with variable name

    this.expectCurrent(TokenType.IN) // Skip over the IN token

    const iterable = this.curToken.literal
    this.nextToken() // Done with iterable

    // Skip over new line/end statement
    this.expectCurrentIsAnyOf([TokenType.NEWLINE, TokenType.END_STATEMENT])

    const statements = this.parseBlock()

    return {
      type: StatementType.FOR,
      tokenLiteral,
      lineNumber,
      variableName,
      iterable,
      statements
    }
    
  }

  addSyntaxError(token: Token, message: string) {
    const syntaxError = new SyntaxError(token.lineNumber, message)
    this.errors.push(syntaxError)
  }
}

export function concatenateUrlWithQueryParams(url: string, queryParams: Record<string, string[]>): string {
  if (Object.entries(queryParams).length === 0) {
    return url
  }
  const urlSearchParams = new URLSearchParams()
  for (const [paramName, paramValues] of Object.entries(queryParams)) {
    for (const paramValue of paramValues) {
      urlSearchParams.append(paramName, paramValue)
    }
  }
  return url + '?' + urlSearchParams.toString()
}
