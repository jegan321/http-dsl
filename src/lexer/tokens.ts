export enum TokenType {
    STRING = 'STRING',
    ASSIGNMENT = 'ASSIGNMENT',
    EOF = 'EOF',
    NEWLINE = 'NEWLINE',
    COLON = 'COLON',
    OPEN_BRACE = 'OPEN_BRACE',
    CLOSE_BRACE = 'CLOSE_BRACE',
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