export enum StatementType {
  REQUEST = 'REQUEST',
  SET = 'SET',
  PRINT = 'PRINT',
  PROMPT = 'PROMPT',
  DEFAULT = 'DEFAULT',
  WRITE = 'WRITE',
  TEST = 'TEST',
  ASSERT = 'ASSERT',
  IF = 'IF'
}

export type Statement =
  | RequestStatement
  | PrintStatement
  | SetStatement
  | PromptStatement
  | DefaultStatement
  | WriteStatement
  | TestStatement
  | AssertStatement
  | IfStatement

export interface RequestStatement {
  type: StatementType.REQUEST
  tokenLiteral: string
  lineNumber: number
  method: string
  url: string
  headers: Record<string, string>
  body?: string
  /**
   * Only set when Content-Type is application/x-www-form-urlencoded
   */
  formEncodedBody?: Record<string, string>
}

export interface PrintStatement {
  type: StatementType.PRINT
  tokenLiteral: string
  lineNumber: number
  printValue: string
}

export interface SetStatement {
  type: StatementType.SET
  tokenLiteral: string
  lineNumber: number
  variableName: string
  variableValue: string
}

export interface PromptStatement {
  type: StatementType.PROMPT
  tokenLiteral: string
  variableName: string
}

export interface DefaultStatement {
  type: StatementType.DEFAULT
  tokenLiteral: string
  lineNumber: number
  host?: string
  headerName?: string
  headerValue?: string
}

export interface WriteStatement {
  type: StatementType.WRITE
  tokenLiteral: string
  lineNumber: number
  fileName: string
  content: string
}

export interface TestStatement {
  type: StatementType.TEST
  tokenLiteral: string
  lineNumber: number
}

export interface AssertStatement {
  type: StatementType.ASSERT
  tokenLiteral: string
  lineNumber: number
  expression: string
  failureMessage?: string
}

export class Program {
  statements: Statement[]

  constructor(statements: Statement[]) {
    this.statements = statements
  }
}

export interface IfStatement {
  type: StatementType.IF
  tokenLiteral: string
  lineNumber: number
  condition: string
  statements: Statement[]
}
