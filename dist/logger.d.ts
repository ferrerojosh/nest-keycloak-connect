import { LoggerService, LogLevel } from '@nestjs/common';
/**
 * Wrapper for Nest Logger, since the new ConsoleLogger will only arrive on Nest 8.0
 */
export declare class KeycloakLogger implements LoggerService {
    private logger;
    private logLevels;
    private readonly DEFAULT_LOG_LEVEL;
    constructor(providedLogLevels: LogLevel[]);
    private setDefaultLogLevel;
    private isLogLevelSet;
    log(message: any, context?: string): void;
    error(message: any, trace?: string, context?: string): void;
    warn(message: any, context?: string): void;
    debug?(message: any, context?: string): void;
    verbose?(message: any, context?: string): void;
    private isLogLevelEnabled;
    private callWrapped;
}
