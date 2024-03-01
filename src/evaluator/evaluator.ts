import { Program, RequestStatement, SetStatement, StatementType } from '../parser/ast'
import { Environment, UnknownVariableGetter } from './environment'
import { AxiosHttpClient, FetchHttpClient, HttpClient, HttpResponse } from './http-client'
import { InputOutput, TerminalInputOutput } from './input-output'
import { replaceVariables } from './replace-variables'

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
    const environment = Environment.build(io)
    const httpClient = new FetchHttpClient()
    return new Evaluator(environment, httpClient, io)
  }

  async evaluate(program: Program) {
    for (const statement of program.statements) {
      switch (statement.type) {
        case StatementType.REQUEST:
          await this.replaceRequestStatementVariables(this.environment, statement)
          const httpResponse = await this.httpClient.sendRequest(statement)
          this.printResponse(httpResponse)
          break
        case StatementType.SET:
          await this.replaceSetStatementVariables(this.environment, statement)
          this.environment.setVariable(statement.variableName, statement.variableValue)
          break
      }
    }
  }

  async replaceRequestStatementVariables(environment: Environment, request: RequestStatement) {
    request.method = await replaceVariables(environment, request.method)
    request.url = await replaceVariables(environment, request.url)
    for (const [key, value] of Object.entries(request.headers)) {
      request.headers[key] = await replaceVariables(environment, value)
    }
    const replacedBody = await replaceVariables(environment, request.body)
    request.body = replacedBody ? replacedBody : undefined // Replace empty string with undefined
  }

  async replaceSetStatementVariables(environment: Environment, setStatement: SetStatement) {
    setStatement.variableValue = await replaceVariables(environment, setStatement.variableValue)
  }

  printResponse(httpResponse: HttpResponse) {
    this.io.write(httpResponse.status)
    const responseBody = httpResponse.body
    this.io.write(responseBody)

    // TODO: Below was needed for the axios version of HttpClient
    // if (isJsonResponse(httpResponse)) {
    //   var jsonString = JSON.stringify(responseBody, null, 2)
    //   this.io.write(jsonString)
    // } else {
    //   this.io.write(responseBody)
    // }
  }
}

function isJsonResponse(httpResponse: HttpResponse): boolean {
  const contentType = httpResponse.headers['content-type']
  return contentType != null && contentType.includes('application/json')
}
