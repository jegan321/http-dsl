export enum StatementType {
  REQUEST = 'REQUEST',
  SET = 'SET',
  PRINT = 'PRINT'
}

export enum Command {

  // Request commands
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',

  // Other commands
  SET = 'SET',
}

export const REQUEST_COMMANDS: Command[] = [
  Command.GET, Command.POST, Command.PUT, Command.DELETE
]

export type Statement = RequestStatement | SetStatement

export interface RequestStatement {
  type: StatementType.REQUEST
  tokenLiteral: string
  method: string
  url: string
  headers: Record<string, string>
  body?: string
}

export interface SetStatement {
  type: StatementType.SET
  tokenLiteral: string
  variableName: string
  variableValue: string
}

export class Program {
  statements: Statement[]

  constructor(statements: Statement[]) {
    this.statements = statements
  }
}
