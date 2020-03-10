import { SetMetadata } from '@nestjs/common';

/**
 * Keycloak Resource.
 * @param resource - name of resource
 */
export const Resource = (resource: string) => SetMetadata('resource', resource);
