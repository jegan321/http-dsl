import fs from 'fs'
import { parse } from '../parser/parser'
import { Evaluator } from '../evaluator/evaluator'
import { AxiosHttpClient } from '../evaluator/http-client'
import { ConsoleLogPrinter } from '../evaluator/printer'
import { Environment } from '../evaluator/environment'

export class FileHandler {
  async execute(fileLocation: string) {
    const fileContent = fs.readFileSync(fileLocation, 'utf8')

    const requests = parse(fileContent)

    const evaluator = new Evaluator(
      new Environment(),
      new AxiosHttpClient(), 
      new ConsoleLogPrinter()
    )
    await evaluator.evaluate(requests)
  }
}
