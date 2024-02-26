import { Request } from '../parser/ast'
import { Environment, UnknownVariableGetter } from './environment'
import { AxiosHttpClient, HttpClient, HttpResponse } from './http-client'
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
    const unknownVariableGetter: UnknownVariableGetter = (variableName) => {
      return io.prompt(`Enter value for unknown variable ${variableName}: `)
    }
    const environment = new Environment(unknownVariableGetter)
    const httpClient = new AxiosHttpClient()
    return new Evaluator(environment, httpClient, io)
  }

  async evaluate(requests: Request[]) {
    for (const request of requests) {
      this.replaceVariables(this.environment, request)
      const httpResponse = await this.httpClient.sendRequest(request)
      this.printResponse(httpResponse)
    }
  }

  replaceVariables(environment: Environment, request: Request): void {
    request.method = replaceVariables(environment, request.method)
    request.url = replaceVariables(environment, request.url)
    for (const [key, value] of Object.entries(request.headers)) {
      request.headers[key] = replaceVariables(environment, value)
    }
    request.body = replaceVariables(environment, request.body)
  }

  printResponse(httpResponse: HttpResponse) {
    this.io.write(httpResponse.status)
    const responseBody = httpResponse.body
    if (isJsonResponse(httpResponse)) {
      var jsonString = JSON.stringify(responseBody, null, 2)
      this.io.write(jsonString)
    } else {
      this.io.write(responseBody)
    }
  }

}

function isJsonResponse(httpResponse: HttpResponse): boolean {
  const contentType = httpResponse.headers['content-type']
  return contentType != null && contentType.includes('application/json')
}
