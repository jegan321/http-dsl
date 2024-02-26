export interface UnknownVariableGetter {
  (variableName: string): Promise<string>
}

export class Environment {
  unknownVariableGetter: UnknownVariableGetter
  variables: Record<string, string> = {}

  constructor(unknownVariableGetter: UnknownVariableGetter) {
    this.unknownVariableGetter = unknownVariableGetter
  }

  setVariable(name: string, value: string): void {
    this.variables[name] = value
  }

  getVariable(name: string): Promise<string> {
    const variableValue = this.variables[name]
    if (variableValue != null) {
      return Promise.resolve(variableValue)
    } else {
      return this.unknownVariableGetter(name)
    }
  }

  reset() {
    this.variables = {}
  }
}
