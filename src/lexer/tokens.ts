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
  PRINT = 'PRINT',
  PROMPT = 'PROMPT',
  DEFAULT = 'DEFAULT',
  WRITE = 'WRITE',
  ASSERT = 'ASSERT'
}

export const COMMAND_TOKENS = [
  TokenType.GET,
  TokenType.POST,
  TokenType.PUT,
  TokenType.DELETE,
  TokenType.PATCH,
  TokenType.SET,
  TokenType.PRINT,
  TokenType.PROMPT,
  TokenType.DEFAULT,
  TokenType.WRITE,
  TokenType.ASSERT
]

export const REQUEST_TOKENS = [TokenType.GET, TokenType.POST, TokenType.PUT, TokenType.DELETE, TokenType.PATCH]

export class Token {
  type: TokenType
  literal: string
  line: number

  constructor(type: TokenType, literal: string, line: number) {
    this.type = type
    this.literal = literal
    this.line = line
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
    PRINT: TokenType.PRINT,
    PROMPT: TokenType.PROMPT,
    DEFAULT: TokenType.DEFAULT,
    WRITE: TokenType.WRITE,
    ASSERT: TokenType.ASSERT
  }
  return keywordMap[literal.toUpperCase()]
}
