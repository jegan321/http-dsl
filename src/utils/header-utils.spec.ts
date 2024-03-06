import { expect, test, describe } from 'vitest'
import { isContentType } from './header-utils'

describe('isContentType', async () => {
  test('isContentType() should return true when content-type is application/json', () => {
    const headers = { 'content-type': 'application/json' }
    expect(isContentType('application/json', headers)).toBe(true)
  })
  test('isContentType() should return true when Content-Type is application/json', () => {
    const headers = { 'Content-Type': 'application/json' }
    expect(isContentType('application/json', headers)).toBe(true)
  })
  test('isContentType() should return true when Content-Type is application/json;other', () => {
    const headers = { 'Content-Type': 'application/json;other' }
    expect(isContentType('application/json', headers)).toBe(true)
  })
  test('isContentType() should return false when Content-Type is text/plain', () => {
    const headers = { 'Content-Type': 'text/plain' }
    expect(isContentType('application/json', headers)).toBe(false)
  })
})
