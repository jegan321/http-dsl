export enum TokenType {
  STRING = 'STRING',
  MULTI_LINE_STRING = 'MULTI_LINE_STRING',
  NEWLINE = 'NEWLINE',
  END_STATEMENT = 'END_STATEMENT',
  END_FILE = 'END_FILE',
  ILLEGAL = 'ILLEGAL',

  // Keywords
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  // TODO: Add other HTTP verbs
  SET = 'SET',
  PRINT = 'PRINT'
}

export const COMMAND_TOKENS = [
  TokenType.GET,
  TokenType.POST,
  TokenType.PUT,
  TokenType.DELETE,
  TokenType.PATCH,
  TokenType.SET,
  TokenType.PRINT
]

export const REQUEST_TOKENS = [TokenType.GET, TokenType.POST, TokenType.PUT, TokenType.DELETE]

export class Token {
  type: TokenType
  literal: string

  constructor(type: TokenType, literal: string) {
    this.type = type
    this.literal = literal
  }
}

/**
 * Returns null if the literal is not a keyword
 */
export function getKeywordForLiteral(literal: string): TokenType | null {
  const keywordMap: Record<string, TokenType> = {
    GET: TokenType.GET,
    POST: TokenType.POST,
    PUT: TokenType.PUT,
    DELETE: TokenType.DELETE,
    PATCH: TokenType.PATCH,
    SET: TokenType.SET,
    PRINT: TokenType.PRINT
  }
  return keywordMap[literal.toUpperCase()]
}
