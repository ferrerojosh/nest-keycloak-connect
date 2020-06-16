/**
 * Keycloak enforcer configuration.
 * Please see https://www.keycloak.org/docs/latest/securing_apps/#_nodejs_adapter for more information.
 */
export interface KeycloakResourceConfig {
  /**
   * If response_mode is set to `token`, permissions are obtained from the server
   * on behalf of the subject represented by the bearer token that was sent to your application.
   *
   * If response_mode is set to `permissions` (default mode), the server only returns the list of
   * granted permissions, without issuing a new access token.
   */
  response_mode?: 'token' | 'permissions';
  /**
   * By default, the policy enforcer will use the `client_id` defined to the application.
   */
  resource_server_id?: string;
  /**
   * Pushes additional claims to the server and make them available in your policies for keycloak
   * to make decisions.
   */
  claims: (request: any) => { [k: string]: any };
}
