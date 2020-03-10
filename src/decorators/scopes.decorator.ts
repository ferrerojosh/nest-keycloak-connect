import { SetMetadata } from '@nestjs/common';

/**
 * Keycloak Authorization Scopes.
 * @param scopes - scopes that are associated with the resource
 */
export const Scopes = (...scopes: string[]) => SetMetadata('scopes', scopes);
