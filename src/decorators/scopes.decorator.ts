import { SetMetadata } from '@nestjs/common';
import * as KeycloakConnect from 'keycloak-connect';

export const META_SCOPES = 'scopes';

export const META_CONDITIONAL_SCOPES = 'conditional-scopes';

export type ConditionalScopeFn = (
  request: any,
  token: KeycloakConnect.Token,
) => string[];

/**
 * Keycloak authorization scopes.
 * @param scopes - scopes that are associated with the resource
 */
export const Scopes = (...scopes: string[]) => SetMetadata(META_SCOPES, scopes);

/**
 * Keycloak authorization conditional scopes.
 * @param scopes - scopes that are associated with the resource depending on the conditions
 */
export const ConditionalScopes = (resolver: ConditionalScopeFn) =>
  SetMetadata(META_CONDITIONAL_SCOPES, resolver);

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractRequest } from '../util';

/**
 * Retrieves the resolved scopes.
 * @since 1.5.0
 */
export const ResolvedScopes = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const [req] = extractRequest(ctx);
    return req.scopes;
  },
);
