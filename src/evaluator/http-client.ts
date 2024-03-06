import { stringify } from 'querystring'
import { RequestStatement } from '../parser/ast'
// import fetch from 'node-fetch' // TODO: This is complaining about Common JS

export class HttpResponse {
  status: number
  headers: Record<string, string>
  body: string
  
  constructor(status: number, headers: Record<string, string>, body: string) {
    this.status = status
    this.headers = headers
    this.body = body
  }

  isJson(): boolean {
    const contentTypeHeader = Object.keys(this.headers).find(headerName => headerName.toLowerCase() === 'content-type')
    return contentTypeHeader != null && this.headers[contentTypeHeader].toLowerCase().includes('application/json')
  }

  stringify() {
    let body = this.body
    if (this.isJson()) {
      body = JSON.stringify(JSON.parse(body), null, 2)
    }
    return `Status: ${this.status}\nBody: ${body}`
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

    return new HttpResponse(
      response.status,
      responseHeaders,
      body
    )
  }
}

export class MockHttpClient implements HttpClient {
  public status: number = 200
  public headers: Record<string, string> = {}
  public body: Record<string, any> = {}
  public sentRequests: RequestStatement[] = []
  async sendRequest(request: RequestStatement): Promise<HttpResponse> {
    this.sentRequests.push(request)

    return new HttpResponse(
      this.status,
      this.headers,
      JSON.stringify(this.body, null, 2)
    )
  }
}
