import { Program, RequestStatement, SetStatement, Statement, StatementType } from '../parser/ast'
import { getErrorMessage } from '../utils/error-utils'
import { hasContentType, hasHeader } from '../utils/header-utils'
import { Environment } from './environment'
import { FetchHttpClient, HttpClient, HttpRequest, HttpResponse } from './http-client'
import { InputOutput, TerminalInputOutput } from './input-output'
import { isSingleExpressionString, replaceExpressionsInString, replaceSingleExpression } from './replace-expressions'

export class Evaluator {
  private globalEnvironment: Environment
  private httpClient: HttpClient
  private io: InputOutput

  constructor(environment: Environment, httpClient: HttpClient, io: InputOutput) {
    this.globalEnvironment = environment
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
      await this.evaluateStatements(this.globalEnvironment, program.statements)
    } catch (error: any) {
      if (!error.silent) {
        const errorMessage = getErrorMessage(error)
        this.io.write(errorMessage)
      }
    }
  }

  async evaluateStatements(env: Environment, statements: Statement[]): Promise<void> {
    for (const statement of statements) {
      switch (statement.type) {
        case StatementType.REQUEST:
          this.replaceRequestStatementExpressions(env, statement)
          if (statement.url.startsWith('/') && env.defaultHost) {
            // Automatically use defaultHost if host is not specified in the statement
            statement.url = env.defaultHost + statement.url
          }
          if (!hasContentType(statement.headers)) {
            // Default Content-Type to application/json for convenience
            statement.headers['Content-Type'] = 'application/json'
          }
          for (const [defaultHeaderName, defaultHeaderValue] of Object.entries(env.defaultHeaders)) {
            if (!hasHeader(statement.headers, defaultHeaderName)) {
              statement.headers[defaultHeaderName] = defaultHeaderValue
            }
          }
          const httpRequest = new HttpRequest(statement.method, statement.url, statement.headers, statement.body)
          env.variables.request = httpRequest
          const httpResponse = await this.httpClient.sendRequest(httpRequest)
          env.variables.response = httpResponse

          if (!httpResponse.isOk()) {
            this.exitWithErrors(statement.lineNumber, [
              `Request failed with status ${httpResponse.status}. ${httpRequest.url}`,
              httpResponse.body
            ])
          }

          break
        case StatementType.PRINT:
          const printValue = replaceExpressionsInString(env, statement.printValue)
          await this.io.write(printValue)
          break
        case StatementType.PROMPT:
          const userInput = await this.io.prompt(`Enter value for "${statement.variableName}": `)
          env.variables[statement.variableName] = userInput
          break
        case StatementType.SET:
          const replaceFunction = isSingleExpressionString(statement.variableValue)
            ? replaceSingleExpression
            : replaceExpressionsInString
          env.variables[statement.variableName] = replaceFunction(env, statement.variableValue)
          break
        case StatementType.DEFAULT:
          if (statement.host) {
            env.defaultHost = replaceExpressionsInString(env, statement.host)
          }
          if (statement.headerName && statement.headerValue) {
            env.defaultHeaders[statement.headerName] = replaceExpressionsInString(env, statement.headerValue)
          }
          break
        case StatementType.WRITE:
          const fileName = replaceExpressionsInString(env, statement.fileName)
          const content = replaceExpressionsInString(env, statement.content)
          this.io.writeToFile(fileName, content)
          break
        case StatementType.ASSERT:
          const expressionValue = replaceSingleExpression(env, statement.expression)
          if (!expressionValue) {
            this.exitWithErrors(statement.lineNumber, [
              `Assertion failed: ${statement.expression}`,
              statement.failureMessage
            ])
          }
          break
        case StatementType.IF:
          const conditionValue = replaceSingleExpression(env, statement.condition)
          if (conditionValue) {
            await this.evaluateStatements(statement.statements)
          }
      }
    }
  }

  replaceRequestStatementExpressions(env: Environment, request: RequestStatement) {
    request.method = replaceExpressionsInString(env, request.method)
    request.url = replaceExpressionsInString(env, request.url)
    for (const [key, value] of Object.entries(request.headers)) {
      request.headers[key] = replaceExpressionsInString(env, value)
    }
    const replacedBody = replaceExpressionsInString(env, request.body)
    request.body = replacedBody ? replacedBody : undefined // Replace empty string with undefined
  }

  exitWithErrors(lineNumber: number, messages: any[]) {
    this.io.write(`Runtime error on line ${lineNumber}:`)
    for (const message of messages) {
      if (message) {
        this.io.write(message)
      }
    }
    const error: any = new Error()
    error.silent = true
    throw error
  }
}
