import { Environment } from './environment';

/**
 * Returns the value with all variables replaced with their values from the environment.
 * Variable syntax is `{{variableName}}`.
 * 
 * TODO: Rename to expressions?
 * TODO: Change to a state machine-based approach
 */
export function replaceVariables(environment: Environment, value: string): string {
  return value.replace(/{{(.*?)}}/g, (match, variableName) => {
    const variableValue = environment.get(variableName)
    return variableValue ?? match
  })
}