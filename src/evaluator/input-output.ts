import { createInterface } from 'node:readline'
import fs from 'node:fs'

export interface InputOutput {
  prompt(promptText: string): Promise<string>
  write(value: any): Promise<void>
  writeToFile(fileName: string, content: string): Promise<void>
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

  async writeToFile(fileName: string, content: string): Promise<void> {
    fs.writeFileSync(fileName, content)
  }
}

export class MockInputOutput implements InputOutput {
  promptResponse: string = ''
  writes: any[] = []
  fileWrites: { fileName: string; content: string }[] = []

  async prompt(promptText: string): Promise<string> {
    this.writes.push(promptText)
    return this.promptResponse
  }

  async write(value: any): Promise<void> {
    this.writes.push(value)
  }

  async writeToFile(fileName: string, content: string): Promise<void> {
    this.fileWrites.push({ fileName, content })
  }
}
