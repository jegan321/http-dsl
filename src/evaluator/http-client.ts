import { Request } from '../parser/ast'
import axios from 'axios'

export interface HttpResponse {
  status: number
  headers: Record<string, string>
  body: any
}

export interface HttpClient {
  sendRequest: (request: Request) => Promise<HttpResponse>
}

export class AxiosHttpClient implements HttpClient {
  async sendRequest(ast: Request): Promise<HttpResponse> {
    let response: axios.AxiosResponse
    try {
      response = await axios.request({
        method: ast.method,
        url: ast.url,
        headers: ast.headers,
        data: ast.body
      })
    } catch (error) {
      console.log('Error while sending request')
      throw new Error()
    }

    const responseHeaders: Record<string, string> = {}
    for (const [key, value] of Object.entries(response.headers)) {
      responseHeaders[key] = value.toLowerCase()
    }

    return {
      status: response.status,
      headers: responseHeaders,
      body: response.data
    }
  }
}

export class MockHttpClient implements HttpClient {
  public status: number = 200
  public headers: Record<string, string> = {}
  public body: any = {}
  public sentRequests: Request[] = []
  async sendRequest(request: Request): Promise<HttpResponse> {
    this.sentRequests.push(request)
    return {
      status: this.status,
      headers: this.headers,
      body: this.body
    }
  }
}
