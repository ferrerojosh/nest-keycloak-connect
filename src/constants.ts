/**
 * Used internally, provides keycloak options for the Nest guards.
 */
export const KEYCLOAK_CONNECT_OPTIONS = 'KEYCLOAK_CONNECT_OPTIONS';

/**
 * Key for injecting a keycloak instance.
 */
export const KEYCLOAK_INSTANCE = 'KEYCLOAK_INSTANCE';

/**
 * Key for injecting the nest keycloak logger.
 */
export const KEYCLOAK_LOGGER = 'KEYCLOAK_LOGGER';

/**
 * Role matching mode.
 */
export enum RoleMatchingMode {
  /**
   * Match all roles
   */
  ALL = 'all',
  /**
   * Match any roles
   */
  ANY = 'any',
}
