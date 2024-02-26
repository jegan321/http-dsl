import { Environment } from './environment';

/**
 * Returns the value with all variables replaced with their values from the environment.
 * Variable syntax is `{{variableName}}`.
 * 
 * TODO: Rename to expressions?
 * TODO: Change to a state machine-based approach
 */
export async function replaceVariables(environment: Environment, value: string): Promise<string> {
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
      const variableValue = await environment.getVariable(variableName)
      output += variableValue
      i = end + 1
    } else {
      output += current
    }
  }
  return output
}