import { InputOutput } from './input-output'

export interface UnknownVariableGetter {
  (variableName: string): Promise<string>
}

export class Environment {
  unknownVariableGetter: UnknownVariableGetter
  variables: Record<string, string> = {}

  constructor(unknownVariableGetter: UnknownVariableGetter) {
    this.unknownVariableGetter = unknownVariableGetter
  }

  static build(io: InputOutput) {
    const unknownVariableGetter: UnknownVariableGetter = (variableName) => {
      return io.prompt(`Enter value for unknown variable ${variableName}: `)
    }
    return new Environment(unknownVariableGetter)
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
