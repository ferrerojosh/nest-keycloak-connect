"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Public = exports.Unprotected = exports.META_SKIP_AUTH = exports.META_UNPROTECTED = void 0;
const common_1 = require("@nestjs/common");
exports.META_UNPROTECTED = 'unprotected';
exports.META_SKIP_AUTH = 'skip-auth';
/**
 * Allow user to use unprotected routes.
 * @since 1.2.0
 * @param skipAuth attaches authorization header to user object when `false`, defaults to `true`
 */
exports.Unprotected = (skipAuth = true) => common_1.applyDecorators(common_1.SetMetadata(exports.META_UNPROTECTED, true), common_1.SetMetadata(exports.META_SKIP_AUTH, skipAuth));
/**
 * Alias for `@Unprotected`.
 * @since 1.2.0
 * @param skipAuth attaches authorization header to user object when `false`, defaults to `true`
 */
exports.Public = (skipAuth = true) => common_1.applyDecorators(common_1.SetMetadata(exports.META_UNPROTECTED, true), common_1.SetMetadata(exports.META_SKIP_AUTH, skipAuth));
