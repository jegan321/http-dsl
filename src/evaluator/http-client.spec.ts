import { expect, test, describe } from 'vitest'
import { HttpResponse, MockHttpClient } from './http-client'
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

describe('HttpResponse', async () => {
  test('stringify() should return string representation', () => {
    const httpResponse = new HttpResponse(
      200,
      { 'content-type': 'application/json' },
      JSON.stringify({ message: 'Hello' })
    )
    expect(httpResponse.stringify()).toBe(`Status: 200\nBody: {\n  "message": "Hello"\n}`)
  })
  test('isJson() should return true when content-type is application/json', () => {
    const httpResponse = new HttpResponse(
      200,
      { 'content-type': 'application/json' },
      JSON.stringify({ message: 'Hello' })
    )
    expect(httpResponse.isJson()).toBe(true)
  })
  test('isJson() should return true when Content-Type is application/json', () => {
    const httpResponse = new HttpResponse(
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({ message: 'Hello' })
    )
    expect(httpResponse.isJson()).toBe(true)
  })
  test('isJson() should return true when Content-Type is application/json;other', () => {
    const httpResponse = new HttpResponse(
      200,
      { 'Content-Type': 'application/json;other' },
      JSON.stringify({ message: 'Hello' })
    )
    expect(httpResponse.isJson()).toBe(true)
  })
})
