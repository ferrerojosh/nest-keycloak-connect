import Keycloak from 'keycloak-connect';

/**
 * Keycloak Connect options. Extends `keycloak-connect` configuration.
 */
export interface KeycloakConnectOptions extends Keycloak.KeycloakConfig {
  authServerUrl: string;
  secret: string;
  clientId: string;
  bearerOnly: boolean;
}
