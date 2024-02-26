import { Request } from './ast'

export function parse(input: string): Request[] {
  const parsedContent: Request | Request[] = JSON.parse(input)
  return !Array.isArray(parsedContent) ? [parsedContent] : parsedContent
}
