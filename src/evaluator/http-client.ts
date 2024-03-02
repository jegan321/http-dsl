import { RequestStatement } from '../parser/ast'
// import fetch from 'node-fetch' // TODO: This is complaining about Common JS

export interface HttpResponse {
  status: number
  headers: Record<string, string>
  body: string
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

    return {
      status: response.status,
      headers: responseHeaders,
      body: body
    }
  }
}

export class MockHttpClient implements HttpClient {
  public status: number = 200
  public headers: Record<string, string> = {}
  public body: Record<string, any> = {}
  public sentRequests: RequestStatement[] = []
  async sendRequest(request: RequestStatement): Promise<HttpResponse> {
    this.sentRequests.push(request)
    return {
      status: this.status,
      headers: this.headers,
      body: JSON.stringify(this.body, null, 2)
    }
  }
}
