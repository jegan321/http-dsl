import { Request } from '../parser/ast'
import { Environment } from './environment'
import { HttpClient, HttpResponse } from './http-client'
import { Printer } from './printer'
import { replaceVariables } from './replace-variables'

export class Evaluator {
  private environment: Environment
  private httpClient: HttpClient
  private printer: Printer

  constructor(environment: Environment, httpClient: HttpClient, printer: Printer) {
    this.environment = environment
    this.httpClient = httpClient
    this.printer = printer
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
    this.printer.print(httpResponse.status)
    const responseBody = httpResponse.body
    if (isJsonResponse(httpResponse)) {
      var jsonString = JSON.stringify(responseBody, null, 2)
      this.printer.print(jsonString)
    } else {
      this.printer.print(responseBody)
    }
  }

}

function isJsonResponse(httpResponse: HttpResponse): boolean {
  const contentType = httpResponse.headers['content-type']
  return contentType != null && contentType.includes('application/json')
}
