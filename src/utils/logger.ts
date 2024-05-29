export enum LogLevel {
    DEBUG = 1,
    OFF = 0,
}

export class Logger {
    constructor(private logLevel: LogLevel) {}

    logDebug(message: string): void {
        if (this.logLevel >= LogLevel.DEBUG) {
            console.log(`DEBUG: ${message}`)
        }
    }
}