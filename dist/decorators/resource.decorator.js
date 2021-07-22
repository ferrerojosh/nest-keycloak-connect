"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = exports.META_RESOURCE = void 0;
const common_1 = require("@nestjs/common");
exports.META_RESOURCE = 'resource';
/**
 * Keycloak Resource.
 * @param resource - name of resource
 */
exports.Resource = (resource) => common_1.SetMetadata(exports.META_RESOURCE, resource);
