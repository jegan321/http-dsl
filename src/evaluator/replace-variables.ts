import { Environment } from './environment'
import { evaluateExpression } from './expressions'

export function replaceExpressions(environment: Environment, value?: string): string {
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
      const evaluatedExpressions = evaluateExpression(expression, environment)
      output += evaluatedExpressions
      i = end + 1
    } else {
      output += current
    }
  }
  return output
}
