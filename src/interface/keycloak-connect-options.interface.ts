// The typings are a bit of a mess, I'm sure there's a better way to do this.

import {
  PolicyEnforcementMode,
  RoleMerge,
  TokenValidation,
} from '../constants';

export type KeycloakConnectOptions = string | KeycloakConnectConfig;

/**
 * Multi tenant configuration.
 */
export interface MultiTenantOptions {
  /**
   * Option to always resolve the realm and secret. Disabled by default.
   */
  resolveAlways?: boolean;
  /**
   * The realm resolver function.
   */
  realmResolver: (request: any) => Promise<string> | string;
  /**
   * The realm secret resolver function.
   */
  realmSecretResolver?: (
    realm: string,
    request?: any,
  ) => Promise<string> | string;
  /**
   * The realm auth server url resolver function.
   */
  realmAuthServerUrlResolver?: (
    realm: string,
    request?: any,
  ) => Promise<string> | string;
  /**
   * The realm client id resolver function.
   */
  realmClientIdResolver: (
    realm: string,
    request?: any,
  ) => Promise<string> | string;
}

/**
 * Library only configuration.
 */
export interface NestKeycloakConfig {
  /**
   * Cookie key.
   */
  cookieKey?: string;

  /**
   * Sets the policy enforcement mode for this adapter, defaults to {@link PolicyEnforcementMode.PERMISSIVE}.
   */
  policyEnforcement?: PolicyEnforcementMode;

  /**
   * Sets the token validation method, defaults to {@link TokenValidation.ONLINE}.
   */
  tokenValidation?: TokenValidation;

  /**
   * Multi tenant options.
   */
  multiTenant?: MultiTenantOptions;

  /**
   * Role merging options.
   */
  roleMerge?: RoleMerge;
}

/**
 * Keycloak Connect options.
 * @see {@link https://github.com/keycloak/keycloak-nodejs-connect/blob/f8e011aea5/middleware/auth-utils/config.js}
 */
export interface KeycloakConnectConfig extends NestKeycloakConfig {
  /**
   * Realm ID.
   */
  realm?: string;

  /**
   * Client/Application ID.
   */
  resource?: string;
  /**
   * Client/Application ID.
   * @see {KeycloakConnectOptions#resource}
   */
  'client-id'?: string;
  /**
   * Client/Application ID.
   * @see {KeycloakConnectOptions#resource}
   */
  clientId?: string;

  /**
   * Client/Application secret.
   */
  credentials?: KeycloakCredentials;
  /**
   * Client/Application secret.
   * @see {KeycloakCredentials#secret}
   */
  secret: string;

  /**
   * If this is a public application or confidential.
   * @see {KeycloakConnectOptions#public}
   */
  'public-client'?: boolean;
  /**
   * If this is a public application or confidential.
   */
  public?: boolean;

  /**
   * Authentication server URL.
   * @see {KeycloakConnectOptions#authServerUrl}
   */
  'auth-server-url'?: string;
  /**
   * Authentication server URL.
   * @see {KeycloakConnectOptions#authServerUrl}
   */
  'server-url'?: string;
  /**
   * Authentication server URL.
   * @see {KeycloakConnectOptions#authServerUrl}
   */
  serverUrl?: string;
  /**
   * Authentication server URL.
   */
  authServerUrl?: string;

  /**
   * How many minutes before retrying getting the keys.
   * @see {KeycloakConnectOptions#minTimeBetweenJwksRequests}
   */
  'min-time-between-jwks-requests'?: number;
  /**
   * How many minutes before retrying getting the keys.
   */
  minTimeBetweenJwksRequests?: number;

  /**
   * If this is a Bearer Only application.
   * @see {KeycloakConnectOptions#bearerOnly}
   */
  'bearer-only'?: boolean;
  /**
   * If this is a Bearer Only application.
   */
  bearerOnly?: boolean;

  /**
   * Formatted public-key.
   * @see {KeycloakConnectOptions#realmPublicKey}
   */
  'realm-public-key'?: string;
  /**
   * Formatted public-key.
   */
  realmPublicKey?: string;

  /**
   * Verify token audience.
   * @see {KeycloakConnectOptions#verifyTokenAudience}
   */
  'verify-token-audience'?: boolean;
  /**
   * Verify token audience.
   */
  verifyTokenAudience?: boolean;

  /**
   * Confidential port.
   */
  'confidential-port'?: string | number;

  /**
   * Require SSL.
   */
  'ssl-required'?: string;
}

/**
 * Represents Keycloak credentials.
 */
export interface KeycloakCredentials {
  /**
   * Client/Application secret.
   */
  secret: string;
}
