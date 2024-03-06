import { Environment } from './environment';

export async function evaluateExpression(expression: string, environment: Environment): Promise<any> {
    let code = `with (vars) {return ${expression}}`
    const func = new Function('vars', code)
    const vars = environment.variables
    return func.call(vars)
}
