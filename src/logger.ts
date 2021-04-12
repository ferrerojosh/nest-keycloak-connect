import { Logger, LoggerService, LogLevel } from '@nestjs/common';

/**
 * Wrapper for Nest Logger, since the new ConsoleLogger will only arrive on Nest 8.0
 */
export class KeycloakLogger implements LoggerService {
  private logger = new Logger('Keycloak');

  constructor(private readonly logLevels: LogLevel[]) {}

  log(message: any, context?: string) {
    this.callWrapped('log', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.callWrapped('error', message, context);
  }

  warn(message: any, context?: string) {
    this.callWrapped('warn', message, context);
  }

  debug?(message: any, context?: string) {
    this.callWrapped('debug', message, context);
  }

  verbose?(message: any, context?: string) {
    this.callWrapped('verbose', message, context);
  }

  private isLogLevelEnabled(level: LogLevel): boolean {
    return this.logLevels.includes(level);
  }

  private callWrapped(
    name: 'log' | 'warn' | 'debug' | 'verbose' | 'error',
    message: any,
    context?: string,
  ) {
    if (!this.isLogLevelEnabled(name)) {
      return;
    }
    const func = this.logger[name];

    func && func.call(this.logger, message, context);
  }
}
