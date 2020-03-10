/**
 * Keycloak Connect options.
 */
export interface KeycloakConnectOptions {
  /**
   * Authentication server URL as defined in keycloak.json
   */
  authServerUrl: string;
  /**
   * Client secret credientials.
   */
  secret: string;
  /**
   * Client identifier.
   */
  clientId: string;
  /**
   * Keycloak realm.
   */
  realm: string;
}
