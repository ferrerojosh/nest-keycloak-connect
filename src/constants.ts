/**
 * Used internally, provides keycloak options for the Nest guards.
 */
export const KEYCLOAK_CONNECT_OPTIONS = 'KEYCLOAK_CONNECT_OPTIONS';

/**
 * Key for injecting a keycloak instance.
 */
export const KEYCLOAK_INSTANCE = 'KEYCLOAK_INSTANCE';

/**
 * Key for injecting a keycloak multi tenant service.
 */
export const KEYCLOAK_MULTITENANT_SERVICE = 'KEYCLOAK_MULTITENANT_SERVICE';

/**
 * Default cookie key.
 */
export const KEYCLOAK_COOKIE_DEFAULT = 'KEYCLOAK_JWT';

/**
 * Role matching mode.
 */
export enum RoleMatch {
  /**
   * Match all roles
   */
  ALL = 'all',
  /**
   * Match any roles
   */
  ANY = 'any',
}

/**
 * Policy enforcement mode.
 */
export enum PolicyEnforcementMode {
  /**
   * Deny all request when there is no matching resource.
   */
  ENFORCING = 'enforcing',
  /**
   * Allow all request even when there's no matching resource.
   */
  PERMISSIVE = 'permissive',
}

/**
 * Token validation methods.
 */
export enum TokenValidation {
  /**
   * The default validation method, performs live validation via Keycloak servers.
   */
  ONLINE = 'online',
  /**
   * Validate offline against the configured keycloak options.
   */
  OFFLINE = 'offline',
  /**
   * Does not check for any validation. Should only be used for special cases (i.e development, internal networks)
   */
  NONE = 'none',
}

export enum RoleMerge {
  /**
   * Overrides roles if defined both controller and handlers, with controller taking over.
   */
  OVERRIDE,
  /**
   * Merges all roles from both controller and handlers.
   */
  ALL,
}
