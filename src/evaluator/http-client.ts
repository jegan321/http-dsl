import { RequestStatement } from '../parser/ast'
import { isContentType } from '../utils/header-utils'
import { formatJson } from '../utils/json-utils'
// import fetch from 'node-fetch' // TODO: This is complaining about Common JS

export class HttpResponse {
  status: number
  headers: Record<string, string>
  body: string | Record<string, any>

  constructor(status: number, headers: Record<string, string>, body: string) {
    this.status = status
    this.headers = headers

    this.body = isContentType('application/json', this.headers) ? parseJsonBody(body) : body
  }

  stringify() {
    let body = this.body
    if (typeof body === 'object') {
      body = JSON.stringify(body, null, 2)
    }
    const statusLine = `Status: ${this.status}`
    const responseHeaders = Object.entries(this.headers).map(([key, value]) => `${key}: ${value}`).join('\n')
    return `${statusLine}\n\n${responseHeaders}\n\n${body}`
  }
}

function parseJsonBody(body: string): string | Record<string, any> {
  try {
    return JSON.parse(body)
  } catch (error) {
    // TODO: currently I am ignoring the error and returning the body as string
    return body
  }
}

export interface HttpClient {
  sendRequest: (request: RequestStatement) => Promise<HttpResponse>
}

export class FetchHttpClient implements HttpClient {
  async sendRequest(requestStatement: RequestStatement): Promise<HttpResponse> {
    const response = await fetch(requestStatement.url, {
      method: requestStatement.method,
      headers: requestStatement.headers,
      body: requestStatement.body
    })

    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    const body = await response.text()

    return new HttpResponse(response.status, responseHeaders, body)
  }
}

export class MockHttpClient implements HttpClient {
  // TODO: Rename theses field to be more clear
  status: number = 200
  headers: Record<string, string> = {}
  body: Record<string, any> = {}
  sentRequests: RequestStatement[] = []
  async sendRequest(request: RequestStatement): Promise<HttpResponse> {
    this.sentRequests.push(request)

    return new HttpResponse(this.status, this.headers, JSON.stringify(this.body, null, 2))
  }
}
