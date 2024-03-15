import fs from 'fs'
import { Evaluator } from '../evaluator/evaluator'
import { Lexer } from '../lexer/lexer'
import { Parser } from '../parser/parser'

export class FileHandler {
  async execute(fileLocation: string): Promise<void> {
    const fileContent = fs.readFileSync(fileLocation, 'utf8')
    const lexer = new Lexer(fileContent)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()
    if (parser.errors.length) {
      for (const { line, message } of parser.errors) {
        console.log(`Syntax error, line ${line}: ${message}`)
      }
      return
    }
    const evaluator = Evaluator.build()
    await evaluator.evaluate(program)
  }
}
