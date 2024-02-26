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
      readline.question(promptText, resolve)
    })
  }

  async write(value: any): Promise<void> {
    console.log(value)
  }
}
