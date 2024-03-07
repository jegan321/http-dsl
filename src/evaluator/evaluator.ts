import { Program, RequestStatement, SetStatement, StatementType } from '../parser/ast'
import { getErrorMessage } from '../utils/error-utils'
import { hasContentType } from '../utils/header-utils'
import { Environment } from './environment'
import { FetchHttpClient, HttpClient, HttpResponse } from './http-client'
import { InputOutput, TerminalInputOutput } from './input-output'
import { replaceExpressions } from './replace-expressions'

export class Evaluator {
  private environment: Environment
  private httpClient: HttpClient
  private io: InputOutput

  constructor(environment: Environment, httpClient: HttpClient, io: InputOutput) {
    this.environment = environment
    this.httpClient = httpClient
    this.io = io
  }

  static build(): Evaluator {
    const io = new TerminalInputOutput()
    const environment = new Environment()
    const httpClient = new FetchHttpClient()
    return new Evaluator(environment, httpClient, io)
  }

  async evaluate(program: Program) {
    try {
      await this.evaluateProgram(program)
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      this.io.write(errorMessage)
    }
  }

  async evaluateProgram(program: Program) {
    for (const statement of program.statements) {
      switch (statement.type) {
        case StatementType.REQUEST:
          this.replaceRequestStatementExpressions(this.environment, statement)
          if (statement.url.startsWith('/') && this.environment.hasVariable('host')) {
            // Automatically use host variable if host is not specified in the statement
            statement.url = this.environment.variables.host + statement.url
          }
          if (!hasContentType(statement.headers)) {
            // Default Content-Type to application/json for convenience
            statement.headers['Content-Type'] = 'application/json'
          }
          const httpResponse = await this.httpClient.sendRequest(statement)
          this.environment.variables.response = httpResponse
          break
        case StatementType.PRINT:
          const printValue = replaceExpressions(this.environment, statement.printValue)
          await this.io.write(printValue)
          break
        case StatementType.SET:
          this.replaceSetStatementExpressions(this.environment, statement)
          this.environment.variables[statement.variableName] = statement.variableValue
          break
      }
    }
  }

  replaceRequestStatementExpressions(environment: Environment, request: RequestStatement) {
    request.method = replaceExpressions(environment, request.method)
    request.url = replaceExpressions(environment, request.url)
    for (const [key, value] of Object.entries(request.headers)) {
      request.headers[key] = replaceExpressions(environment, value)
    }
    const replacedBody = replaceExpressions(environment, request.body)
    request.body = replacedBody ? replacedBody : undefined // Replace empty string with undefined
  }

  replaceSetStatementExpressions(environment: Environment, setStatement: SetStatement) {
    setStatement.variableValue = replaceExpressions(environment, setStatement.variableValue)
  }

  printResponse(httpResponse: HttpResponse) {
    this.io.write(httpResponse.status)
    const responseBody = httpResponse.body
    this.io.write(responseBody)
  }
}
