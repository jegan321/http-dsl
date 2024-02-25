import  fs  from 'fs'
import { parse } from '../parser/parser'
import { evaluate } from '../evaluator/evaluator'

export class FileHandler {
  execute(fileLocation: string) {
    const fileContent = fs.readFileSync(fileLocation, 'utf8')
    const requests = parse(fileContent)
    evaluate(requests)
  }
}
