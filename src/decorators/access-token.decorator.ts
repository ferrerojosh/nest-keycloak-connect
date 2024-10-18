import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractRequest } from '../util';

/**
 * Retrieves the currently used access token
 * @since 2.0.0
 */
export const AccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const [req] = extractRequest(ctx);
    return req.accessToken;
  },
);
