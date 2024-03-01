import { expect, test, describe } from 'vitest'
import { MockHttpClient } from './http-client'
import { StatementType } from '../parser/ast'

describe('sendRequest', async () => {
  test('should return http response', async () => {
    const httpClient = new MockHttpClient()
    httpClient.status = 200
    httpClient.headers = { 'content-type': 'application/json' }
    httpClient.body = { message: 'Hello' }
    const response = await httpClient.sendRequest({
      type: StatementType.REQUEST,
      tokenLiteral: 'GET',
      method: 'GET',
      url: 'https://example.com',
      headers: {}
    })
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('application/json')
    expect(response.body).toEqual(JSON.stringify({ message: 'Hello' }, null, 2))
  })
})
