"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = exports.META_ROLES = void 0;
const common_1 = require("@nestjs/common");
exports.META_ROLES = 'roles';
/**
 * Keycloak user roles.
 * @param roleMetaData - meta data for roles and matching mode
 * @since 1.1.0
 */
exports.Roles = (roleMetaData) => common_1.SetMetadata(exports.META_ROLES, roleMetaData);
