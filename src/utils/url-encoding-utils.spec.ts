import { expect, test, describe } from 'vitest'
import { urlEncode } from './url-encoding-utils'

describe('urlEncode', async () => {
  test('should return object as a URL-encoded string', () => {
    const obj = {
      foo: 'foo value',
      bar: '&=&'
    }
    const result = urlEncode(obj)
    expect(result).toBe(`foo=foo+value&bar=%26%3D%26`)
  })
})
