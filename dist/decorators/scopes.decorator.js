"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scopes = exports.META_SCOPES = void 0;
const common_1 = require("@nestjs/common");
exports.META_SCOPES = 'scopes';
/**
 * Keycloak Authorization Scopes.
 * @param scopes - scopes that are associated with the resource
 */
exports.Scopes = (...scopes) => common_1.SetMetadata(exports.META_SCOPES, scopes);
