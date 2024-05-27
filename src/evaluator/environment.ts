export class Environment {
  private variables: Record<string, any> = {}
  private outerEnvironment?: Environment

  defaultHost: string = 'http://localhost:8080'
  defaultHeaders: Record<string, string> = {}

  constructor(outerEnvironment?: Environment) {
    this.outerEnvironment = outerEnvironment
  }

  get(variableName: string): any {
    const variable = this.variables[variableName]
    if (variable === undefined && this.outerEnvironment !== undefined) {
      return this.outerEnvironment.get(variableName)
    }
    return variable
  }

  set(variableName: string, value: any): void {
    // If the variable exists in this environment or there's no outer environment, set it here
    if (this.variables[variableName] !== undefined || this.outerEnvironment === undefined) {
      this.variables[variableName] = value
    } else {
      // Otherwise, try setting it in the outer environment
      this.outerEnvironment.set(variableName, value)
    }
  }

  /**
   * Returns a single object that has all the variables from this environment and its outer environments
   */
  getFlattenedVariables(): Record<string, any> {
    if (this.outerEnvironment === undefined) {
      return this.variables
    }
    return { ...this.outerEnvironment.getFlattenedVariables(), ...this.variables }
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
