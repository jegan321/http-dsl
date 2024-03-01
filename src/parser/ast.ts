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

export const REQUEST_COMMANDS: Command[] = [
  Command.GET, Command.POST, Command.PUT, Command.DELETE
]

export interface Statement {
  type: StatementType
  tokenLiteral: string
}

export class RequestStatement implements Statement {
  type: StatementType.REQUEST
  tokenLiteral: string
  method: string
  url: string

  constructor(tokenLiteral: string, url: string) {
    this.type = StatementType.REQUEST
    this.tokenLiteral = tokenLiteral
    this.method = tokenLiteral
    this.url = url
  }

}

export class Program {
  statements: Statement[]

  constructor(statements: Statement[]) {
    this.statements = statements
  }
}
