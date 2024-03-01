import fs from 'fs'
import { Evaluator } from '../evaluator/evaluator'
import { Lexer } from '../lexer/lexer'
import { Parser } from '../parser/parser'

export class FileHandler {
  async execute(fileLocation: string) {
    const fileContent = fs.readFileSync(fileLocation, 'utf8')
    const lexer = new Lexer(fileContent)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()
    const evaluator = Evaluator.build()
    await evaluator.evaluate(program)
  }
}
