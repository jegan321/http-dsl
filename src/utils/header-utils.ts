/**
 * Checks if the headers contain the given content type string, ignoring case and 
 * checking for partial matches.
 */
export function isContentType(contentTypeValue: string, headers: Record<string, string>): boolean {
    const headerName = Object.keys(headers)
        .find(headerName => headerName.toLowerCase() === 'content-type')
    return headerName != null && headers[headerName].toLowerCase().includes(contentTypeValue.toLowerCase())
}