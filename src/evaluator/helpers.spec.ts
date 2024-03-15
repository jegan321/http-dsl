import { expect, test, describe } from 'vitest'
import { base64 } from './helpers'

describe('base64', async () => {
  test('should encode user1:password1', async () => {
    const result = base64('user1:password1')
    expect(result).toBe('dXNlcjE6cGFzc3dvcmQx')
  })
})
