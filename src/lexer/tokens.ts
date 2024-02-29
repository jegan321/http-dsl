export enum TokenType {
    STRING = 'STRING',
    NEWLINE = 'NEWLINE',
    OPEN_BRACE = 'OPEN_BRACE',
    CLOSE_BRACE = 'CLOSE_BRACE',
    EOF = 'EOF',
    ILLEGAL = 'ILLEGAL',
}

export class Token {
    type: TokenType
    literal: string
  
    constructor(type: TokenType, literal: string) {
      this.type = type
      this.literal = literal
    }
  }