// import * as readline from 'node:readline'
// import { stdin as input, stdout as output } from 'node:process'
import { FileHandler } from './file.js'

export function main() {
  const args = process.argv.slice(2)
  if (args[0]) {
    const fileLocation = args[0]
    const fileHandler = new FileHandler()
    fileHandler.execute(fileLocation)
  } else {
    console.error('File not provided')
  }
}
