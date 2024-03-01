import { FileHandler } from './file.js'
import { REPL } from './repl.js'

export async function main() {
  const args = process.argv.slice(2)
  if (args[0]) {
    const fileLocation = args[0]
    const fileHandler = new FileHandler()
    await fileHandler.execute(fileLocation)
  } else {
    const repl = REPL.build()
    await repl.start()
  }
}
