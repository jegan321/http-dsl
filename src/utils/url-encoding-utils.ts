export function urlEncode(object: Record<string, string>): string {
  const urlSearchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(object)) {
    if (typeof value === 'string') {
      urlSearchParams.set(key, value)
    }
  }
  return urlSearchParams.toString()
}
