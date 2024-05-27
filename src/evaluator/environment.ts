export class Environment {
  private variables: Record<string, any> = {}
  private outerEnvironment?: Environment

  defaultHost: string = 'http://localhost:8080'
  defaultHeaders: Record<string, string> = {}

  get(variableName: string): any {
    const variable = this.variables[variableName]
    if (variable === undefined && this.outerEnvironment !== undefined) {
      return this.outerEnvironment.get(variableName)
    }
    return variable
  }

  set(variableName: string, value: any): void {
    this.variables[variableName] = value
  }

  getVariables(): Record<string, any> {
    return this.variables
  }

  hasVariable(variableName: string): boolean {
    return variableName in this.variables
  }

  reset() {
    this.variables = {}
    this.defaultHost = 'http://localhost:8080'
    this.defaultHeaders = {}
  }
}
