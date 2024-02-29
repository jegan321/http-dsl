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
      return tokens
    }

    _nextToken(): Token {
      let token = new Token(TokenType.ILLEGAL, this.char)
  
      this.skipSpacesAndTabs()

      if (this.char === '') {
        // TODO: Is this needed for the parser? This block never happens when calling getAllTokens()
        token = new Token(TokenType.EOF, this.char)
      } else if (this.char === '\n') {
        token = new Token(TokenType.NEWLINE, this.char)
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
      const start = this.position + 1
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

function isLetter(char: string): boolean {
  if (!char) return false
  if (char === '_') {
    // Special case for underscore because it can be used in an identifier
    return true
  }
  return char.toLowerCase() != char.toUpperCase()
}

function isDigit(char: string): boolean {
  if (!char) return false
  return !isNaN(parseFloat(char))
}