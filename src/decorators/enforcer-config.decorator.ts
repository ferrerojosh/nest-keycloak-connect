import { SetMetadata } from '@nestjs/common';
import * as KeycloakConnect from 'keycloak-connect';

export const META_ENFORCER_CONFIG = 'enforcer-config';

/**
 * Keycloak Resource.
 * @param config - resource configuration
 */
export const EnforcerConfig = (enforcerOpts: KeycloakConnect.EnforcerOptions) =>
  SetMetadata(META_ENFORCER_CONFIG, enforcerOpts);
