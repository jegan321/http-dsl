/**
 * Base64 encodes a string
 * 
 * TODO: Move to Environment?
 */
export function base64(input: string): string {
    return Buffer.from(input).toString('base64')
}