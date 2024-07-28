/**
 * Base64 encodes a string
 */
export function base64(input: string): string {
  return Buffer.from(input).toString('base64');
}

/**
 * Base64 decodes a string
 */
export function base64Decode(input: string): string {
  return Buffer.from(input, 'base64').toString('utf-8');
}
