import { Request } from '../parser/ast'
import { HttpResponse, sendHttpRequest } from './http-client'
import { printToTerminal } from './printer'

export async function evaluate(requests: Request[]) {
  for (const request of requests) {
    const httpResponse = await sendHttpRequest(request)
    printResponse(httpResponse)
  }
}

function printResponse(httpResponse: HttpResponse) {
  printToTerminal(httpResponse.status)
  const responseBody = httpResponse.body
  if (isJsonResponse(httpResponse)) {
    var jsonString = JSON.stringify(responseBody, null, 2)
    printToTerminal(jsonString)
  } else {
    printToTerminal(responseBody)
  }
}

function isJsonResponse(httpResponse: HttpResponse): boolean {
  const contentType = httpResponse.headers['content-type']
  return contentType != null && contentType.includes('application/json')
}
