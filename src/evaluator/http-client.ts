import { Request } from '../parser/ast'
import axios from 'axios'

export interface HttpResponse {
  status: number
  headers: Record<string, string>
  body: any
}

export async function sendHttpRequest(ast: Request): Promise<HttpResponse> {
  const response = await axios.request({
    method: ast.method,
    url: ast.url,
    headers: ast.headers,
    data: ast.body
  })

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
