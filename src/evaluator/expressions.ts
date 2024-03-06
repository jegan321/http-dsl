import { Environment } from './environment';

export function evaluateExpression(expression: string, environment: Environment): any {
    let code = `with (vars) {return ${expression}}`
    const func = new Function('vars', code)
    const vars = environment.variables
    return func(vars)
}
