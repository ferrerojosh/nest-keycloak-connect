"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnforcerOptions = exports.META_ENFORCER_OPTIONS = void 0;
const common_1 = require("@nestjs/common");
exports.META_ENFORCER_OPTIONS = 'enforcer-options';
/**
 * Keycloak enforcer options
 * @param opts - enforcer options
 * @since 1.3.0
 */
exports.EnforcerOptions = (opts) => common_1.SetMetadata(exports.META_ENFORCER_OPTIONS, opts);
