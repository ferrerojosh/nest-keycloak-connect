import { SetMetadata } from '@nestjs/common';

export const META_SCOPES = 'scopes';

/**
 * Keycloak Authorization Scopes.
 * @param scopes - scopes that are associated with the resource
 */
export const Scopes = (...scopes: string[]) => SetMetadata(META_SCOPES, scopes);
