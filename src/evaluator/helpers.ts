/**
 * Base64 encodes a string
 */
export function base64(input: string): string {
  return Buffer.from(input).toString('base64')
}
