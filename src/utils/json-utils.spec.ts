import { expect, test, describe } from 'vitest'
import { formatJson } from './json-utils'

describe('formatJson', async () => {
    test('formatJson() should return human-readable JSON from minified JSON', () => {
      const input = `{"message":"Hello","number":123}`
      const result = formatJson(input)
      const expected =
`
{
  "message": "Hello",
  "number": 123
}
`
      expect(result).toBe(expected.trim()
      )
    })
  })