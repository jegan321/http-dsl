import { Token, TokenType } from './tokens'

export class Lexer {
    private input: string
    private position: number
    private nextPosition: number
    private char: string
    private prevToken?: Token

    constructor(input: string) {
        this.input = input.trimStart()
        this.position = 0
        this.nextPosition = 0
        this.char = ''
        this.readChar()
    }

    /**
     * Set char to the next character in the input and increment the
     * position and readPosition cursors.
     */
    readChar(): void {
      if (this.nextPosition >= this.input.length) {
        this.char = ''
      } else {
        this.char = this.input[this.nextPosition]
      }
      this.position = this.nextPosition
      this.nextPosition++
    }

    /**
     * Look at current character return the corresponding token. Then
     * advance the cursors.
     */
    nextToken(): Token {
      const token = this._nextToken()
      this.prevToken = token
      return token
    }

    _nextToken(): Token {
      let token = new Token(TokenType.EOF, this.char)
  
      this.skipSpacesAndTabs()
  
      switch (this.char) {
        case '':
          token = new Token(tokens.EOF, this.char)
          break
        default:
          if (isLetter(this.char)) {
            token.literal = this.readIdentifier()
            token.type = lookupIdent(token.literal)
            return token
          } else if (isDigit(this.char)) {
            token.type = tokens.NUMBER
            token.literal = this.readNumber()
            return token
          } else {
            token = new Token(tokens.ILLEGAL, this.char)
          }
      }
  
      this.readChar()
  
      return token
    }

    skipSpacesAndTabs() {
      while (this.char === ' ' || this.char === '\t') {
        this.readChar()
      }
    }
}