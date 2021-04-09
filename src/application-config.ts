import * as pino from 'pino'

export interface LoggingOptions {
  level?: pino.Level
  prettyPrint?: boolean
}

export interface ApplicationConfig {
  prefix?: string
  loggingOptions?: LoggingOptions
}
