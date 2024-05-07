import { expect, test, describe } from 'vitest'
import { HttpRequest, HttpResponse, MockHttpClient } from './http-client'
import { StatementType } from '../parser/ast'

describe('sendRequest', async () => {
  test('should return http response', async () => {
    const httpClient = new MockHttpClient()
    httpClient.status = 200
    httpClient.headers = { 'content-type': 'application/json' }
    httpClient.body = { message: 'Hello' }
    const httpRequest = new HttpRequest('GET', 'https://example.com', {})
    const response = await httpClient.sendRequest(httpRequest)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('application/json')
    expect(response.body).toEqual({ message: 'Hello' })
  })
})
