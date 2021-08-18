import { Logger, LoggerService, LogLevel } from '@nestjs/common';

/**
 * Wrapper for Nest Logger. Will be removed in 2.0.
 */
export class KeycloakLogger implements LoggerService {
  private logger = new Logger('Keycloak');
  private logLevels: LogLevel[];
  private readonly DEFAULT_LOG_LEVEL = 'log';

  constructor(providedLogLevels: LogLevel[]) {
    this.isLogLevelSet(providedLogLevels)
      ? (this.logLevels = providedLogLevels)
      : this.setDefaultLogLevel();
  }

  private setDefaultLogLevel = () => {
    this.logLevels = [this.DEFAULT_LOG_LEVEL];
    this.logger.verbose(
      'No LogLevel for KeycloakLogger provided; falling back to default: ' +
        this.DEFAULT_LOG_LEVEL,
    );
  };

  private isLogLevelSet = (logLevels: LogLevel[]) =>
    Array.isArray(logLevels) && logLevels.length;

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context?: string,
  ) {
    if (!this.isLogLevelEnabled(name)) {
      return;
    }
    const func = this.logger[name];

    func && func.call(this.logger, message);
  }
}
