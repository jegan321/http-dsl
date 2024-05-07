import { RequestStatement } from '../parser/ast'
import { isContentType } from '../utils/header-utils'
import { formatJson } from '../utils/json-utils'
// import fetch from 'node-fetch' // TODO: This is complaining about Common JS

export class HttpResponse {
  status: number
  headers: Record<string, string>
  body: string | Record<string, any>
  timeInMillis: number
  timestamp: number

  constructor(
    status: number,
    headers: Record<string, string>,
    body: string,
    timeTook: number,
    timestamp: number = Date.now()
  ) {
    this.status = status
    this.headers = headers
    this.timeInMillis = timeTook
    this.timestamp = timestamp

    this.body = isContentType('application/json', this.headers) ? parseJsonBody(body) : body
  }

  stringify() {
    let body = this.body
    if (typeof body === 'object') {
      body = JSON.stringify(body, null, 2)
    }

    const receivedResponseLine = `Received response in ${parseFloat(this.timeInMillis.toFixed(4))} milliseconds`
    const dateLine = `Date: ${new Date(this.timestamp).toLocaleString()}`
    const statusLine = `Status: ${this.status}`
    const responseHeaders = Object.entries(this.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
    return `${receivedResponseLine}\n${dateLine}\n${statusLine}\n\n${responseHeaders}\n\n${body}`
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
    const startTime = performance.now()

    const response = await fetch(requestStatement.url, {
      method: requestStatement.method,
      headers: requestStatement.headers,
      body: requestStatement.body
    })

    const endTime = performance.now()
    const timeTook = endTime - startTime

    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    const body = await response.text()

    return new HttpResponse(response.status, responseHeaders, body, timeTook)
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

    return new HttpResponse(this.status, this.headers, JSON.stringify(this.body, null, 2), 200)
  }
}
