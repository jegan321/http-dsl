export enum StatementType {
  REQUEST = 'REQUEST',
  SET = 'SET',
  PRINT = 'PRINT',
  PROMPT = 'PROMPT',
  DEFAULT = 'DEFAULT',
  WRITE = 'WRITE',
}

export enum Command {
  // Request commands
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',

  // Other commands
  SET = 'SET',
  PRINT = 'PRINT'
}

export type Statement = RequestStatement | PrintStatement | SetStatement | PromptStatement | DefaultStatement | WriteStatement

export interface RequestStatement {
  type: StatementType.REQUEST
  tokenLiteral: string
  method: string
  url: string
  headers: Record<string, string>
  body?: string
}

export interface PrintStatement {
  type: StatementType.PRINT
  tokenLiteral: string
  printValue: string
}

export interface SetStatement {
  type: StatementType.SET
  tokenLiteral: string
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
  host?: string
  headerName?: string
  headerValue?: string
}

export interface WriteStatement {
  type: StatementType.WRITE
  tokenLiteral: string
  fileName: string
  content: string
}

export class Program {
  statements: Statement[]

  constructor(statements: Statement[]) {
    this.statements = statements
  }
}
