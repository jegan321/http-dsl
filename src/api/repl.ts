import { Lexer } from '../lexer/lexer.js'
import { Parser } from '../parser/parser.js'
import { VERSION } from '../version.js'
import { Evaluator } from '../evaluator/evaluator.js'
import { Environment } from '../evaluator/environment.js'
import { InputOutput, TerminalInputOutput } from '../evaluator/input-output.js'
import { FetchHttpClient, HttpClient } from '../evaluator/http-client.js'

export class REPL {
  environment: Environment
  io: InputOutput
  evaluator: Evaluator

  private currentStatement: string = ''

  constructor(environment: Environment, io: InputOutput, httpClient: HttpClient) {
    this.environment = environment
    this.io = io
    this.evaluator = new Evaluator(this.environment, httpClient, this.io)
  }

  static build() {
    const io = new TerminalInputOutput()
    const environment = Environment.build(io)
    const httpClient = new FetchHttpClient()
    return new REPL(environment, io, httpClient)
  }

  async start() {
    this.io.write(`http-script version ${VERSION}`)
    // TODO: Link to docs
    // this.io.write('Go to https://github.com/jegan321/http-script for documentation')
    await this.read()
  }

  async read(): Promise<void> {
    const code = await this.io.prompt('> ')
    this.currentStatement += code + '\n'

    if (code.trim() !== '') {
      return await this.read()
    }

    await this.evaluate(this.currentStatement)
    this.currentStatement = ''

    await this.read()
  }

  async evaluate(code: string) {
    const lexer = new Lexer(code)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()
    if (parser.errors.length) {
      let output = 'Syntax error:\n'
      output += parser.errors.join('\n')
      this.io.write(output)
    }
    await this.evaluator.evaluate(program)
  }
}
