import axios from 'axios'
import { RequestStatement } from '../parser/ast'

export interface HttpResponse {
  status: number
  headers: Record<string, string>
  body: any
}

export interface HttpClient {
  sendRequest: (request: RequestStatement) => Promise<HttpResponse>
}

export class AxiosHttpClient implements HttpClient {
  async sendRequest(requestStatement: RequestStatement): Promise<HttpResponse> {
    let response: axios.AxiosResponse
    try {
      response = await axios.request({
        method: requestStatement.method,
        url: requestStatement.url,
        headers: requestStatement.headers,
        data: requestStatement.body
      })
    } catch (error) {
      console.log('Error while sending request')
      throw new Error() // TODO: better error handling
    }

    const responseHeaders: Record<string, string> = {}
    for (const [key, value] of Object.entries(response.headers)) {
      responseHeaders[key] = value
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
  public sentRequests: RequestStatement[] = []
  async sendRequest(request: RequestStatement): Promise<HttpResponse> {
    this.sentRequests.push(request)
    return {
      status: this.status,
      headers: this.headers,
      body: this.body
    }
  }
}
