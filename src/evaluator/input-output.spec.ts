import { expect, test, describe } from 'vitest'
import { MockInputOutput } from './input-output'

describe('prompt', async () => {
  test('should return response', async () => {
    const io = new MockInputOutput()
    io.promptResponse = 'mock_response'
    const response = await io.prompt('Hello')
    expect(response).toBe('mock_response')
  })
})
