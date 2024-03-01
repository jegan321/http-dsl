import { Token, TokenType } from './tokens'

export class Lexer {
    private input: string
    private position: number
    private nextPosition: number
    private char: string
    private prevToken?: Token

    constructor(input: string) {
        this.input = input.trim()
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
        this.readChar()
        if (this.char === '\n') { 
          this.readChar()
          return new Token(TokenType.END_STATEMENT, this.char)
        } else {
          token = new Token(TokenType.NEWLINE, this.char)
        }
      } else if (isBeginningOfString(this.char)) {
        return new Token(TokenType.STRING, this.readString())
      }

      this.readChar()
  
      return token
    }

    skipSpacesAndTabs() {
      while (this.char === ' ' || this.char === '\t') {
        this.readChar()
      }
    }

    readString() {
      const start = this.position
      while (true) {
        this.readChar()
        if (['', ' ', '\n'].includes(this.char)) {
          break
        }
      }
      return this.input.substring(start, this.position)
    }
}

function isBeginningOfString(char: string): boolean {
  const specialChars = ['\n']
  return !specialChars.includes(char)
}