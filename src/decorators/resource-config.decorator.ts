import { SetMetadata } from '@nestjs/common';
import { KeycloakResourceConfig } from '../interface/keycloak-resource.config';

export const META_RESOURCE_CONFIG = 'resource-config';

/**
 * Keycloak Resource.
 * @param config - resource configuration
 */
export const ResourceConfig = (config: KeycloakResourceConfig) =>
  SetMetadata(META_RESOURCE_CONFIG, config);
