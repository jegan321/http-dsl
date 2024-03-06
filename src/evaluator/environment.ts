export class Environment {
  variables: Record<string, string> = {}

  hasVariable(variableName: string): boolean {
    return variableName in this.variables
  }

  reset() {
    this.variables = {}
  }

  // TODO: Add helper methods
}
