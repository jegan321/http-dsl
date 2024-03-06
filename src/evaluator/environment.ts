export class Environment {
  variables: Record<string, any> = {}

  hasVariable(variableName: string): boolean {
    return variableName in this.variables
  }

  reset() {
    this.variables = {}
  }

  // TODO: Add helper methods
}
