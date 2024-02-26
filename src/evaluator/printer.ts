// TODO: Rename to Output or something?
export interface Printer {
  print: (value: any) => void
}

export class ConsoleLogPrinter implements Printer {
  print(value: any): void {
    console.log(value)
  }
}

export class MockPrinter implements Printer {
  printedValues: any[] = []

  print(value: any): void {
    this.printedValues.push(value)
  }
}
