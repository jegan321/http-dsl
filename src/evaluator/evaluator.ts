import { Request } from '../parser/ast'
import { HttpClient, HttpResponse } from './http-client'
import { Printer } from './printer'

export class Evaluator {
  private httpClient: HttpClient
  private printer: Printer

  constructor(httpClient: HttpClient, printer: Printer) {
    this.httpClient = httpClient
    this.printer = printer
  }

  async evaluate(requests: Request[]) {
    for (const request of requests) {
      const httpResponse = await this.httpClient.sendRequest(request)
      this.printResponse(httpResponse)
    }
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
