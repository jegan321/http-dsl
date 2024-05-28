interface EnvironmentConfig {
  defaultHost?: string
  defaultHeaders: Record<string, string>
}

function defaultConfig() {
  return {
    defaultHeaders: {}
  }
}

export class Environment {
  private variables: Record<string, any> = {}
  private config: EnvironmentConfig = defaultConfig()
  private outerEnvironment?: Environment

  // defaultHost: string = 'http://localhost:8080'
  // defaultHeaders: Record<string, string> = {}

  constructor(outerEnvironment?: Environment) {
    this.outerEnvironment = outerEnvironment
  }

  /**
   * TODO: Change to use this.getVariables since it has the outer env logic built in
   */
  get(variableName: string): any {
    return this.getVariables()[variableName]
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
   * Returns a flattened single object that has all the variables from this environment and its outer environments
   */
  getVariables(): Record<string, any> {
    if (this.outerEnvironment === undefined) {
      return this.variables
    }
    return { ...this.outerEnvironment.getVariables(), ...this.variables }
  }

  hasVariable(variableName: string): boolean {
    return variableName in this.variables
  }

  /**
   * Returns a config value from this environment or its outer environment
   */
  private getConfigValue(key: string): string | undefined {
    const config = this.config as Record<string, any>
    const value = config[key]
    if (value === undefined && this.outerEnvironment !== undefined) {
      return this.outerEnvironment.getConfigValue(key)
    }
    return value
  }

  private setConfigValue(key: string, value: any): void {
    // If the config value exists in this environment or there's no outer environment, set it here
    const config = this.config as Record<string, any>
    if (config[key] !== undefined || this.outerEnvironment === undefined) {
      config[key] = value
    } else {
      // Otherwise, try setting it in the outer environment
      this.outerEnvironment.set(key, value)
    }
  }

  getDefaultHost(): string | undefined {
    return this.getConfigValue('defaultHost')
  }

  setDefaultHost(host: string): void {
    this.setConfigValue('defaultHost', host)
  }

  getDefaultHeaders(): Record<string, string> {
    if (this.outerEnvironment === undefined) {
      return this.config.defaultHeaders
    }
    return { ...this.outerEnvironment.getDefaultHeaders(), ...this.config.defaultHeaders }
  }

  setDefaultHeader(name: string, value: string): void {
    this.config.defaultHeaders[name] = value
  }

  reset() {
    this.variables = {}
    this.config = defaultConfig()
  }
}
