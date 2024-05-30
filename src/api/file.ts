import fs from 'fs'
import { Evaluator } from '../evaluator/evaluator'
import { Lexer } from '../lexer/lexer'
import { Parser } from '../parser/parser'
import { LogLevel, Logger } from '../utils/logger'

export class FileHandler {
  async execute(fileLocation: string): Promise<void> {
    const logLevel = LogLevel.OFF
    const fileContent = fs.readFileSync(fileLocation, 'utf8')
    const lexer = new Lexer(fileContent)
    const parserLogger = new Logger(logLevel, 'parser')
    const parser = new Parser(lexer, parserLogger)
    const program = parser.parseProgram()
    if (parser.errors.length) {
      for (const { lineNumber, message } of parser.errors) {
        console.log(`Line ${lineNumber}, syntax error. ${message}`)
      }
      return
    }
    const evaluatorLogger = new Logger(logLevel, 'evaluator')
    const evaluator = Evaluator.build(evaluatorLogger)
    await evaluator.evaluate(program)
  }
}
