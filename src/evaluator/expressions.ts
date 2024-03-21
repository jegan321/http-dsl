import { Environment } from './environment'
import { base64 } from './helpers'

/**
 * Returns the string value of a JavaScript expression
 */
export function evaluateExpression(expression: string, environment: Environment): string {
  const trimmedExpression = expression.trim()
  let code = `with (vars) {return ${trimmedExpression}}`
  const func = new Function('vars', 'base64', code)
  const vars = environment.variables
  try {
    const result = func(vars, base64)
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
    let errorMessage = ''
    if (error instanceof ReferenceError) {
      errorMessage = error.message
    } else if (error instanceof Error) {
      errorMessage = 'Error evaluating expression: ' + error.message
    } else {
      errorMessage = 'Error evaluating expression'
    }
    throw new Error(errorMessage)
  }
}
