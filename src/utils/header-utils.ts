/**
 * Return true if the headers contain the given header name (ignoring case)
 */
export function hasHeader(headers: Record<string, string>, headerName: string): boolean {
  return Object.keys(headers).some((key) => key.toLowerCase() === headerName.toLowerCase())
}

/**
 * Checks if the headers contain the given content type string, ignoring case and
 * checking for partial matches.
 */
export function isContentType(contentTypeValue: string, headers: Record<string, string>): boolean {
  const headerName = getContentTypeHeaderName(headers)
  return headerName != null && headers[headerName].toLowerCase().includes(contentTypeValue.toLowerCase())
}

export function hasContentType(headers: Record<string, string>): boolean {
  return getContentTypeHeaderName(headers) != null
}

function getContentTypeHeaderName(headers: Record<string, string>): string | undefined {
  return Object.keys(headers).find((headerName) => headerName.toLowerCase() === 'content-type')
}
