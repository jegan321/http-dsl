import { Environment } from './environment'

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
      const variableName = value.substring(i + 2, end)
      const variableValue = environment.variables[variableName]
      output += variableValue
      i = end + 1
    } else {
      output += current
    }
  }
  return output
}
