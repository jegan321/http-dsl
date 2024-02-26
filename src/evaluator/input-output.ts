import { createInterface } from 'node:readline'

export interface InputOutput {
  prompt(promptText: string): Promise<string>
  write(value: any): Promise<void>
}

export class TerminalInputOutput implements InputOutput {
  async prompt(promptText: string): Promise<string> {
    return new Promise((resolve) => {
      const readline = createInterface({
        input: process.stdin,
        output: process.stdout
      })
      readline.question(promptText, (userInput) => {
        readline.close()
        resolve(userInput)
      })
    })
  }

  async write(value: any): Promise<void> {
    console.log(value)
  }
}

export class MockInputOutput implements InputOutput {
  public promptResponse: string = ''

  async prompt(promptText: string): Promise<string> {
    return this.promptResponse
  }

  async write(value: any): Promise<void> {
    // Do nothing
  }
}
