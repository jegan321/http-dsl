export class Environment {

    variables: Record<string, string> = {}

    set(name: string, value: string): void {
        this.variables[name] = value
    }

    get(name: string): string | undefined {
        return this.variables[name]
    }
    
}