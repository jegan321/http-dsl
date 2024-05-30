export enum TokenType {
  STRING = 'STRING',
  MULTI_LINE_STRING = 'MULTI_LINE_STRING',
  NEWLINE = 'NEWLINE',
  END_STATEMENT = 'END_STATEMENT',
  BEGIN_FILE = 'BEGIN_FILE',
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
  TEST = 'TEST',
  ASSERT = 'ASSERT',
  IF = 'IF',
  END = 'END',
  FOR = 'FOR',
  IN = 'IN',
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
  TokenType.TEST,
  TokenType.ASSERT,
  TokenType.IF,
  TokenType.FOR,
]

export const REQUEST_TOKENS = [TokenType.GET, TokenType.POST, TokenType.PUT, TokenType.DELETE, TokenType.PATCH]

export class Token {
  type: TokenType
  literal: string
  lineNumber: number

  constructor(type: TokenType, literal: string, lineNumber: number) {
    this.type = type
    this.literal = literal
    this.lineNumber = lineNumber
  }

  toString() {
    let value = `Token(${this.type}`
    if (this.type === TokenType.STRING || this.type === TokenType.MULTI_LINE_STRING) {
      const literalTruncated = this.literal.length > 10 ? this.literal.slice(0, 20) + '...' : this.literal
      value += `, "${literalTruncated}"`
    }
    value += ')'
    return value
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
    TEST: TokenType.TEST,
    ASSERT: TokenType.ASSERT,
    IF: TokenType.IF,
    END: TokenType.END,
    FOR: TokenType.FOR,
    IN: TokenType.IN,
  }
  return keywordMap[literal.toUpperCase()]
}
