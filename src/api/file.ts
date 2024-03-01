import fs from 'fs'
import { Evaluator } from '../evaluator/evaluator'

export class FileHandler {
  async execute(fileLocation: string) {
    const fileContent = fs.readFileSync(fileLocation, 'utf8')

    // const requests = parseJson(fileContent)

    // const evaluator = Evaluator.build()
    // await evaluator.evaluate(requests)
  }
}
