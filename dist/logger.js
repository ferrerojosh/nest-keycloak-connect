"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeycloakLogger = void 0;
const common_1 = require("@nestjs/common");
/**
 * Wrapper for Nest Logger, since the new ConsoleLogger will only arrive on Nest 8.0
 */
class KeycloakLogger {
    constructor(providedLogLevels) {
        this.logger = new common_1.Logger('Keycloak');
        this.DEFAULT_LOG_LEVEL = 'log';
        this.setDefaultLogLevel = () => {
            this.logLevels = [this.DEFAULT_LOG_LEVEL];
            this.logger.verbose('No LogLevel for KeycloakLogger provided; falling back to default: ' +
                this.DEFAULT_LOG_LEVEL);
        };
        this.isLogLevelSet = (logLevels) => Array.isArray(logLevels) && logLevels.length;
        this.isLogLevelSet(providedLogLevels)
            ? (this.logLevels = providedLogLevels)
            : this.setDefaultLogLevel();
    }
    log(message, context) {
        this.callWrapped('log', message, context);
    }
    error(message, trace, context) {
        this.callWrapped('error', message, context);
    }
    warn(message, context) {
        this.callWrapped('warn', message, context);
    }
    debug(message, context) {
        this.callWrapped('debug', message, context);
    }
    verbose(message, context) {
        this.callWrapped('verbose', message, context);
    }
    isLogLevelEnabled(level) {
        return this.logLevels.includes(level);
    }
    callWrapped(name, message, context) {
        if (!this.isLogLevelEnabled(name)) {
            return;
        }
        const func = this.logger[name];
        func && func.call(this.logger, message, context);
    }
}
exports.KeycloakLogger = KeycloakLogger;
