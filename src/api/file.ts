import fs from 'fs'
import { parse } from '../parser/parser'
import { Evaluator } from '../evaluator/evaluator'
import { AxiosHttpClient } from '../evaluator/http-client'
import { ConsoleLogPrinter } from '../evaluator/printer'

export class FileHandler {
  async execute(fileLocation: string) {
    const fileContent = fs.readFileSync(fileLocation, 'utf8')
    const requests = parse(fileContent)

    const httpClient = new AxiosHttpClient()
    const printer = new ConsoleLogPrinter()
    const evaluator = new Evaluator(httpClient, printer)

    await evaluator.evaluate(requests)
  }
}
