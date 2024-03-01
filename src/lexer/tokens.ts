export enum TokenType {
    STRING = 'STRING',
    NEWLINE = 'NEWLINE',
    OPEN_DOUBLE_BRACE = 'OPEN_DOUBLE_BRACE',
    CLOSE_DOUBLE_BRACE = 'CLOSE_DOUBLE_BRACE',
    END_STATEMENT = 'END_STATEMENT',
    END_FILE = 'END_FILE',
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