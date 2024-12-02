import { Inject, Injectable } from '@nestjs/common';
import KeycloakConnect from 'keycloak-connect';
import { KEYCLOAK_CONNECT_OPTIONS } from '../constants';
import { KeycloakConnectOptions } from '../interface/keycloak-connect-options.interface';

/**
 * Stores all keycloak instances when multi tenant option is defined.
 */
@Injectable()
export class KeycloakMultiTenantService {
  private instances: Map<string, KeycloakConnect.Keycloak> = new Map();

  constructor(
    @Inject(KEYCLOAK_CONNECT_OPTIONS)
    private keycloakOpts: KeycloakConnectOptions,
  ) {}

  /**
   * Clears the cached Keycloak instances.
   */
  clear() {
    this.instances.clear();
  }

  /**
   * Retrieves a keycloak instance based on the realm provided.
   * @param realm the realm to retrieve from
   * @param request the request instance, defaults to undefined
   * @returns the multi tenant keycloak instance
   */
  async get(
    realm: string,
    request: any = undefined,
  ): Promise<KeycloakConnect.Keycloak> {
    if (typeof this.keycloakOpts === 'string') {
      throw new Error(
        'Keycloak configuration is a configuration path. This should not happen after module load.',
      );
    }
    if (
      this.keycloakOpts.multiTenant === null ||
      this.keycloakOpts.multiTenant === undefined
    ) {
      throw new Error(
        'Multi tenant is not defined yet multi tenant service is being called.',
      );
    }

    const authServerUrl = await this.resolveAuthServerUrl(realm, request);
    const secret = await this.resolveSecret(realm, request);
    const clientId = await this.resolveClientId(realm, request);

    // Check if existing
    if (
      this.instances.has(realm) &&
      !this.keycloakOpts.multiTenant.resolveAlways
    ) {
      // Otherwise return the instance
      return this.instances.get(realm);
    } else {
      // TODO: Repeating code from  provider, will need to rework this in 2.0
      // Override realm, secret, and authServerUrl
      const keycloakOpts: any = Object.assign(this.keycloakOpts, {
        authServerUrl,
        realm,
        secret,
        clientId,
      });
      const keycloak: any = new KeycloakConnect({}, keycloakOpts);

      // The most important part
      keycloak.accessDenied = (req: any, res: any, next: any) => {
        req.resourceDenied = true;
        next();
      };

      // Save instance
      this.instances.set(realm, keycloak);
      return keycloak;
    }
  }

  async resolveAuthServerUrl(
    realm: string,
    request: any = undefined,
  ): Promise<string> {
    if (typeof this.keycloakOpts === 'string') {
      throw new Error(
        'Keycloak configuration is a configuration path. This should not happen after module load.',
      );
    }
    if (
      this.keycloakOpts.multiTenant === null ||
      this.keycloakOpts.multiTenant === undefined
    ) {
      throw new Error(
        'Multi tenant is not defined yet multi tenant service is being called.',
      );
    }

    // If no realm auth server url resolver is defined, return defaults
    if (!this.keycloakOpts.multiTenant.realmAuthServerUrlResolver) {
      return (
        this.keycloakOpts.authServerUrl ||
        this.keycloakOpts['auth-server-url'] ||
        this.keycloakOpts.serverUrl ||
        this.keycloakOpts['server-url']
      );
    }

    // Resolve realm authServerUrl
    const resolvedAuthServerUrl =
      this.keycloakOpts.multiTenant.realmAuthServerUrlResolver(realm, request);
    const authServerUrl =
      resolvedAuthServerUrl || resolvedAuthServerUrl instanceof Promise
        ? await resolvedAuthServerUrl
        : resolvedAuthServerUrl;

    // Override auth server url
    // Order of priority: resolved realm auth server url > provided auth server url
    return (
      authServerUrl ||
      this.keycloakOpts.authServerUrl ||
      this.keycloakOpts['auth-server-url'] ||
      this.keycloakOpts.serverUrl ||
      this.keycloakOpts['server-url']
    );
  }

  async resolveClientId(
    realm: string,
    request: any = undefined,
  ): Promise<string> {
    if (typeof this.keycloakOpts === 'string') {
      throw new Error(
        'Keycloak configuration is a configuration path. This should not happen after module load.',
      );
    }
    if (
      this.keycloakOpts.multiTenant === null ||
      this.keycloakOpts.multiTenant === undefined
    ) {
      throw new Error(
        'Multi tenant is not defined yet multi tenant service is being called.',
      );
    }

    // If no realm client-id resolver is defined, return defaults
    if (!this.keycloakOpts.multiTenant.realmClientIdResolver) {
      return this.keycloakOpts.clientId || this.keycloakOpts['client-id'];
    }

    // Resolve realm client-id
    const resolvedClientId =
      this.keycloakOpts.multiTenant.realmClientIdResolver(realm, request);
    const realmClientId =
      resolvedClientId || resolvedClientId instanceof Promise
        ? await resolvedClientId
        : resolvedClientId;

    // Override client-id
    // Order of priority: resolved realm secret > default global secret
    return (
      realmClientId ||
      this.keycloakOpts.clientId ||
      this.keycloakOpts['client-id']
    );
  }

  async resolveSecret(
    realm: string,
    request: any = undefined,
  ): Promise<string> {
    if (typeof this.keycloakOpts === 'string') {
      throw new Error(
        'Keycloak configuration is a configuration path. This should not happen after module load.',
      );
    }
    if (
      this.keycloakOpts.multiTenant === null ||
      this.keycloakOpts.multiTenant === undefined
    ) {
      throw new Error(
        'Multi tenant is not defined yet multi tenant service is being called.',
      );
    }

    // If no realm secret resolver is defined, return defaults
    if (!this.keycloakOpts.multiTenant.realmSecretResolver) {
      return this.keycloakOpts.secret;
    }

    // Resolve realm secret
    const resolvedRealmSecret =
      this.keycloakOpts.multiTenant.realmSecretResolver(realm, request);
    const realmSecret =
      resolvedRealmSecret || resolvedRealmSecret instanceof Promise
        ? await resolvedRealmSecret
        : resolvedRealmSecret;

    // Override secret
    // Order of priority: resolved realm secret > default global secret
    return realmSecret || this.keycloakOpts.secret;
  }
}
