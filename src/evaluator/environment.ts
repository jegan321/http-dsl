export class Environment {
  variables: Record<string, any> = {}
  defaultHost: string = 'http://localhost:8080'
  defaultHeaders: Record<string, string> = {}
  
  hasVariable(variableName: string): boolean {
    return variableName in this.variables
  }

  reset() {
    this.variables = {}
    this.defaultHost = 'http://localhost:8080'
    this.defaultHeaders = {}
  }
}
