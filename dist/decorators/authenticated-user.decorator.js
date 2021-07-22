"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticatedUser = void 0;
const common_1 = require("@nestjs/common");
const util_1 = require("../util");
/**
 * Retrieves the current Keycloak logged-in user.
 * @since 1.5.0
 */
exports.AuthenticatedUser = common_1.createParamDecorator((data, ctx) => {
    const [req] = util_1.extractRequest(ctx);
    return req.user;
});
