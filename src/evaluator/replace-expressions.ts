import { Environment } from './environment'
import { evaluateExpression, evaluateExpressionAsString } from './expressions'

export function replaceExpressionsInString(environment: Environment, value?: string): string {
  if (value == null) {
    return ''
  }
  let output = ''
  for (let i = 0; i < value.length; i++) {
    const current = value[i]
    const next = value[i + 1]
    if (current === '{' && next === '{') {
      const end = value.indexOf('}}', i)
      if (end === -1) {
        throw new Error('Unmatched opening {{')
      }
      const expression = value.substring(i + 2, end)
      const evaluatedExpressions = evaluateExpressionAsString(expression, environment)
      output += evaluatedExpressions
      i = end + 1
    } else {
      output += current
    }
  }
  return output
}

export function isSingleExpressionString(value: string): boolean {
  const trimmedValue = value.trim()
  return trimmedValue.startsWith('{{') && trimmedValue.endsWith('}}')
}

export function replaceSingleExpression(environment: Environment, value: string): any {
  const trimmedValue = value.trim()
  if (!isSingleExpressionString(trimmedValue)) {
    throw new Error('Expected a single expression string')
  }
  const expression = trimmedValue.substring(2, trimmedValue.length - 2)
  return evaluateExpression(expression, environment)
}
