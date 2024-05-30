import {
  ForStatement,
  IfStatement,
  Program,
  RequestStatement,
  SetStatement,
  Statement,
  StatementType
} from '../parser/ast'
import { getErrorMessage } from '../utils/error-utils'
import { hasContentType, hasHeader, isContentType } from '../utils/header-utils'
import { Logger } from '../utils/logger'
import { urlEncode } from '../utils/url-encoding-utils'
import { Environment } from './environment'
import { FetchHttpClient, HttpClient, HttpRequest, HttpResponse } from './http-client'
import { InputOutput, TerminalInputOutput } from './input-output'
import { isSingleExpressionString, replaceExpressionsInString, replaceSingleExpression } from './replace-expressions'

export class Evaluator {
  private globalEnvironment: Environment
  private httpClient: HttpClient
  private io: InputOutput
  private log: Logger

  constructor(environment: Environment, httpClient: HttpClient, io: InputOutput, logger: Logger = new Logger()) {
    this.globalEnvironment = environment
    this.httpClient = httpClient
    this.io = io
    this.log = logger
  }

  static build(logger: Logger = new Logger()): Evaluator {
    const io = new TerminalInputOutput()
    const environment = new Environment()
    const httpClient = new FetchHttpClient()
    return new Evaluator(environment, httpClient, io, logger)
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

  // TODO: Make private methods for each switch case
  async evaluateStatements(env: Environment, statements: Statement[]): Promise<void> {
    for (const statement of statements) {
      switch (statement.type) {
        case StatementType.REQUEST:
          await this.evaluateRequestStatement(env, statement)
          break
        case StatementType.PRINT:
          const printValue = replaceExpressionsInString(env, statement.printValue)
          await this.io.write(printValue)
          break
        case StatementType.PROMPT:
          const userInput = await this.io.prompt(`Enter value for "${statement.variableName}": `)
          env.set(statement.variableName, userInput)
          break
        case StatementType.SET:
          const replaceFunction = isSingleExpressionString(statement.variableValue)
            ? replaceSingleExpression
            : replaceExpressionsInString
          env.set(statement.variableName, replaceFunction(env, statement.variableValue))
          break
        case StatementType.DEFAULT:
          if (statement.host) {
            const defaultHost = replaceExpressionsInString(env, statement.host)
            env.setDefaultHost(defaultHost)
          }
          if (statement.headerName && statement.headerValue) {
            const headerName = statement.headerName
            const headerValue = replaceExpressionsInString(env, statement.headerValue)
            env.setDefaultHeader(headerName, headerValue)
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
          await this.evaluateIfStatement(env, statement)
          break
        case StatementType.FOR:
          await this.evaluateForStatement(env, statement)
          break
      }
    }
  }

  async evaluateRequestStatement(env: Environment, statement: RequestStatement) {
    this.log.debug()
    this.replaceRequestStatementExpressions(env, statement)
    if (statement.url.startsWith('/')) {
      // Automatically use default host if host is not specified in the statement
      const defaultHost = env.getDefaultHost() || 'http://localhost:8080'
      statement.url = defaultHost + statement.url
    }
    if (!hasContentType(statement.headers)) {
      // Default Content-Type to application/json for convenience
      statement.headers['Content-Type'] = 'application/json'
    }
    for (const [defaultHeaderName, defaultHeaderValue] of Object.entries(env.getDefaultHeaders())) {
      if (!hasHeader(statement.headers, defaultHeaderName)) {
        statement.headers[defaultHeaderName] = defaultHeaderValue
      }
    }
    const httpRequest = new HttpRequest(statement.method, statement.url, statement.headers, statement.body)
    env.set('request', httpRequest)

    let now = new Date()
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}:${now.getMilliseconds()}`

    this.log.debug(`${time} ${httpRequest.method} ${httpRequest.url}`)
    for (const [headerName, headerValue] of Object.entries(httpRequest.headers)) {
      this.log.debug(`${time} Header: ${headerName}: ${headerValue}`)
    }
    if (httpRequest.body) {
      this.log.debug(`${time} Body:\n${httpRequest.body}`)
    }

    const httpResponse = await this.httpClient.sendRequest(httpRequest)
    env.set('response', httpResponse)

    this.log.debug(`${time} Response status: ${httpResponse.status}`)
    for (const [headerName, headerValue] of Object.entries(httpResponse.headers)) {
      this.log.debug(`${time} Response header: ${headerName}: ${headerValue}`)
    }

    if (httpResponse.body) {
      this.log.debug(`${time} Response body:\n${httpResponse.getBodyAsString()}`)
    }

    if (!httpResponse.isOk()) {
      this.exitWithErrors(statement.lineNumber, [
        `Request failed with status ${httpResponse.status}. ${httpRequest.url}`,
        httpResponse.body
      ])
    }
  }
  
  async evaluateIfStatement(env: Environment, statement: IfStatement) {
    const conditionValue = replaceSingleExpression(env, statement.condition)
    if (conditionValue) {
      const innerEnvironment = new Environment(env)
      await this.evaluateStatements(innerEnvironment, statement.statements)
    }
  }

  async evaluateForStatement(env: Environment, statement: ForStatement) {
    // The expression inside statement.iterable should evaluate to an array
    const iterable = replaceSingleExpression(env, statement.iterable) as Array<any>
    for (const element of iterable) {
      const innerEnvironment = new Environment(env)
      innerEnvironment.set(statement.variableName, element)
      await this.evaluateStatements(innerEnvironment, statement.statements)
    }
  }

  replaceRequestStatementExpressions(env: Environment, request: RequestStatement) {
    request.method = replaceExpressionsInString(env, request.method)
    request.url = replaceExpressionsInString(env, request.url)
    this.replaceExpressionsInObjectValues(env, request.headers)

    let replacedBody: string | undefined = undefined
    if (request.formEncodedBody) {
      this.replaceExpressionsInObjectValues(env, request.formEncodedBody)
      replacedBody = urlEncode(request.formEncodedBody)
    } else {
      replacedBody = replaceExpressionsInString(env, request.body)
    }
    request.body = replacedBody ? replacedBody : undefined // Replace empty string with undefined
  }

  replaceExpressionsInObjectValues(env: Environment, obj: Record<string, any>): void {
    for (const [key, value] of Object.entries(obj)) {
      obj[key] = replaceExpressionsInString(env, value)
    }
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
