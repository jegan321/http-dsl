export enum StatementType {
  REQUEST = 'REQUEST',
  SET = 'SET',
  PRINT = 'PRINT'
}

export enum Command {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export interface Statement {
  type: StatementType
  tokenLiteral: string
}

export class Program {
  statements: Statement[]

  constructor(statements: Statement[]) {
    this.statements = statements
  }
}
