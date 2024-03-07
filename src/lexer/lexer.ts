import { Token, TokenType, getKeywordForLiteral } from './tokens'

export class Lexer {
  private input: string
  private position: number
  private nextPosition: number
  private char: string
  private nextChar: string
  private prevToken?: Token
  private insideExpression: boolean = false

  constructor(input: string) {
    this.input = input.trim()
    this.position = 0
    this.nextPosition = 0
    this.char = ''
    this.nextChar = ''
    this.readChar()
  }

  /**
   * Set char to the next character in the input and increment the
   * position and readPosition cursors.
   */
  readChar(): void {
    if (this.nextPosition >= this.input.length) {
      this.char = ''
      this.nextChar = ''
    } else {
      this.char = this.input[this.nextPosition]
      if (this.nextPosition + 1 >= this.input.length) {
        this.nextChar = ''
      } else {
        this.nextChar = this.input[this.nextPosition + 1]
      }
    }
    this.position = this.nextPosition
    this.nextPosition++
    if (this.char === '{' && this.input[this.position - 1] === '{') {
      this.insideExpression = true
    }
    if (this.char === '}' && this.input[this.position - 1] === '}') {
      this.insideExpression = false
    }
  }

  /**
   * Look at current character return the corresponding token. Then
   * advance the cursors.
   */
  nextToken(): Token {
    const token = this._nextToken()
    this.prevToken = token
    console.log(token.literal)
    return token
  }

  getAllTokens(): Token[] {
    const tokens = []
    let tokenCount = 0
    while (this.char && tokenCount < 100) {
      tokens.push(this.nextToken())
      tokenCount++
    }
    // TODO: Should I add an EOF token here so it matches the behavior of the parser?
    return tokens
  }

  _nextToken(): Token {
    let token = new Token(TokenType.ILLEGAL, this.char)

    this.skipSpacesAndTabs()

    if (this.char === '') {
      // TODO: Is this needed for the parser? This block never happens when calling getAllTokens()
      token = new Token(TokenType.END_FILE, this.char)
    } else if (this.char === '\n') {
      this.skipSpacesAndTabs()
      if (this.nextChar === '\n') {
        this.readChar()
        this.readChar()
        return new Token(TokenType.END_STATEMENT, this.char)
      } else {
        token = new Token(TokenType.NEWLINE, this.char)
      }
    } else if (this.isBeginningOfMultiLineString()) {
      const literal = this.readMultiLineString()
      return new Token(TokenType.MULTI_LINE_STRING, literal)
    } else if (this.isBeginningOfString()) {
      const literal = this.readString()
      const keyword = getKeywordForLiteral(literal)
      const tokenType = keyword || TokenType.STRING
      return new Token(tokenType, literal)
    }

    this.readChar()

    return token
  }

  // TODO: Rename to skipIgnorableCharacters or skipWhitespaceAndComments
  skipSpacesAndTabs() {
    while (this.char === ' ' || this.char === '\t') {
      this.readChar()
    }
    this.skipComments()
  }

  skipComments() {
    if (this.char === '#') {
      this.readLine()
    }
  }

  isBeginningOfString(): boolean {
    const specialChars = ['\n']
    return !specialChars.includes(this.char)
  }

  readString() {
    const start = this.position
    while (true) {
      this.readChar()
      if (['', '\n'].includes(this.char)) {
        break
      }
      if (this.char === ' ' && !this.insideExpression) {
        break
      }
    }
    return this.input.substring(start, this.position)
  }

  readLine() {
    const start = this.position
    while (true) {
      this.readChar()
      if (['\n', ''].includes(this.char)) {
        break
      }
    }
    return this.input.substring(start, this.position)
  }

  isBeginningOfMultiLineString(): boolean {
    const isJsonOrXml = ['{', , '[', '<'].includes(this.char)
    const isBeginningOfExpression = this.char === '{' && this.nextChar === '{'
    return isJsonOrXml && !isBeginningOfExpression
  }

  readMultiLineString() {
    const start = this.position
    while (true) {
      this.readChar()
      const endOfStatementChars = ['\n', '']
      if (endOfStatementChars.includes(this.char) && endOfStatementChars.includes(this.nextChar)) {
        break
      }
    }
    return this.input.substring(start, this.position)
  }
}
