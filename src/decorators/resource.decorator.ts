import { SetMetadata } from '@nestjs/common';

export const META_RESOURCE = 'resource';

/**
 * Keycloak Resource.
 * @param resource - name of resource
 */
export const Resource = (resource: string) =>
  SetMetadata(META_RESOURCE, resource);
