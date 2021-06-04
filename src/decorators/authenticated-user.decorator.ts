import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractRequest } from '../util';

/**
 * Retrieves the current Keycloak logged-in user.
 * @since 1.5.0
 */
export const AuthenticatedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const [req] = extractRequest(ctx);
    return req.user;
  },
);
