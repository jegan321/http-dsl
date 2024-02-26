import { expect, test, describe } from 'vitest'
import { MockHttpClient } from './http-client'

describe('sendRequest', async () => {
  test('should return http response', async () => {
    const httpClient = new MockHttpClient()
    httpClient.status = 200
    httpClient.headers = { 'content-type': 'application/json' }
    httpClient.body = { message: 'Hello' }
    const response = await httpClient.sendRequest({
      method: 'GET',
      url: 'https://example.com',
      headers: {}
    })
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('application/json')
    expect(response.body).toEqual({ message: 'Hello' })
  })
})
