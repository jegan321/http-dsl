import { Environment } from './environment'
import { base64 } from './helpers'

/**
 * Returns the value of a JavaScript expression. Could return a string, number, object, etc.
 */
export function evaluateExpression(expression: string, environment: Environment): any {
  const trimmedExpression = expression.trim()
  let code = `with (vars) {return ${trimmedExpression}}`
  const func = new Function('vars', 'base64', code)
  const vars = environment.variables
  try {
    return func(vars, base64)
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

/**
 * Returns the string value of a JavaScript expression
 */
export function evaluateExpressionAsString(expression: string, environment: Environment): string {
  var result = evaluateExpression(expression, environment)
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
}
