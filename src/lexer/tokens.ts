export enum TokenType {
    GET,
    POST,
    PUT,
    DELETE,
    PATCH,
    ILLEGAL,
    EOF,
    NEWLINE,
    COLON,
    STRING,
    OPEN_BRACE,
    CLOSE_BRACE
}

export class Token {
    type: TokenType
    literal: string
  
    constructor(type: TokenType, literal: string) {
      this.type = type
      this.literal = literal
    }
  }