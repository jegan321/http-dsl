import { Program, RequestStatement, SetStatement, StatementType } from '../parser/ast'
import { getErrorMessage } from '../utils/error-utils'
import { hasContentType, hasHeader } from '../utils/header-utils'
import { Environment } from './environment'
import { FetchHttpClient, HttpClient, HttpRequest, HttpResponse } from './http-client'
import { InputOutput, TerminalInputOutput } from './input-output'
import { isSingleExpressionString, replaceExpressionsInString, replaceSingleExpression } from './replace-expressions'

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
          if (statement.url.startsWith('/') && this.environment.defaultHost) {
            // Automatically use defaultHost if host is not specified in the statement
            statement.url = this.environment.defaultHost + statement.url
          }
          if (!hasContentType(statement.headers)) {
            // Default Content-Type to application/json for convenience
            statement.headers['Content-Type'] = 'application/json'
          }
          for (const [defaultHeaderName, defaultHeaderValue] of Object.entries(this.environment.defaultHeaders)) {
            if (!hasHeader(statement.headers, defaultHeaderName)) {
              statement.headers[defaultHeaderName] = defaultHeaderValue
            }
          }
          const httpRequest = new HttpRequest(statement.method, statement.url, statement.headers, statement.body)
          this.environment.variables.request = httpRequest
          const httpResponse = await this.httpClient.sendRequest(httpRequest)
          this.environment.variables.response = httpResponse

          if (!httpResponse.isOk()) {
            this.io.write(`Request failed with status ${httpResponse.status}. ${httpRequest.url}`)
            this.io.write(httpResponse.body)
            process.exit(1)
          }

          break
        case StatementType.PRINT:
          const printValue = replaceExpressionsInString(this.environment, statement.printValue)
          await this.io.write(printValue)
          break
        case StatementType.PROMPT:
          const userInput = await this.io.prompt(`Enter value for "${statement.variableName}": `)
          this.environment.variables[statement.variableName] = userInput
          break
        case StatementType.SET:
          const replaceFunction = isSingleExpressionString(statement.variableValue)
            ? replaceSingleExpression
            : replaceExpressionsInString
          this.environment.variables[statement.variableName] = replaceFunction(
            this.environment,
            statement.variableValue
          )
          break
        case StatementType.DEFAULT:
          if (statement.host) {
            this.environment.defaultHost = replaceExpressionsInString(this.environment, statement.host)
          }
          if (statement.headerName && statement.headerValue) {
            this.environment.defaultHeaders[statement.headerName] = replaceExpressionsInString(
              this.environment,
              statement.headerValue
            )
          }
          break
        case StatementType.WRITE:
          const fileName = replaceExpressionsInString(this.environment, statement.fileName)
          const content = replaceExpressionsInString(this.environment, statement.content)
          this.io.writeToFile(fileName, content)
          break
      }
    }
  }

  replaceRequestStatementExpressions(environment: Environment, request: RequestStatement) {
    request.method = replaceExpressionsInString(environment, request.method)
    request.url = replaceExpressionsInString(environment, request.url)
    for (const [key, value] of Object.entries(request.headers)) {
      request.headers[key] = replaceExpressionsInString(environment, value)
    }
    const replacedBody = replaceExpressionsInString(environment, request.body)
    request.body = replacedBody ? replacedBody : undefined // Replace empty string with undefined
  }
}
