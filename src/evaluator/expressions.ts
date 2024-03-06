import { Environment } from './environment'

/**
 * Returns the string value of a JavaScript expression
 */
export function evaluateExpression(expression: string, environment: Environment): string {
  let code = `with (vars) {return ${expression}}`
  const func = new Function('vars', code)
  const vars = environment.variables
  try {
    const result = func(vars)
    if (result == null || typeof result === 'function') {
      // return null for null, undefined and functions
      return 'null'
    }
    if (typeof result === 'object') {
      // If the object contains a stringify() method, use that
      if (typeof result.stringify === 'function') {
        return result.stringify()
      }

      // Convert other objects and arrays into JSON.
      return JSON.stringify(result)
    }
    // Convert booleans and numbers to strings
    return result + ''
  } catch (error) {
    if (error instanceof ReferenceError) {
      throw new Error(error.message)
    } else {
      throw new Error('Error evaluating expression')
    }
  }
}
