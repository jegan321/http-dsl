export enum LogLevel {
  DEBUG = 1,
  OFF = 0
}

export class Logger {
  constructor(
    private logLevel: LogLevel = LogLevel.OFF,
    private loggerName: string = 'logger'
  ) {}

  debug(message: string): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.log(`[${this.loggerName}] ${message}`)
    }
  }
}
