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
   * @returns the multi tenant keycloak instance
   */
  async get(realm: string): Promise<KeycloakConnect.Keycloak> {
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

    if (this.instances.has(realm)) {
      if (this.keycloakOpts.multiTenant.resolveAlways) {
        const keycloak: any = this.instances.get(realm);
        const secret = this.resolveSecret(realm);

        keycloak.config.secret = secret;
        keycloak.grantManager.secret = secret;

        // Save instance
        this.instances.set(realm, keycloak);

        return keycloak;
      }
      return this.instances.get(realm);
    } else {
      const secret = await this.resolveSecret(realm);
      // TODO: Repeating code from  provider, will need to rework this in 2.0
      // Override realm and secret
      const keycloakOpts: any = Object.assign(this.keycloakOpts, {
        realm,
        secret,
      });
      const keycloak: any = new KeycloakConnect({}, keycloakOpts);

      // The most important part
      keycloak.accessDenied = (req: any, res: any, next: any) => {
        req.resourceDenied = true;
        next();
      };

      this.instances.set(realm, keycloak);
      return keycloak;
    }
  }

  async resolveSecret(realm: string): Promise<string> {
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

    // Resolve realm secret
    const resolvedRealmSecret = this.keycloakOpts.multiTenant.realmSecretResolver(
      realm,
    );
    const realmSecret =
      resolvedRealmSecret || resolvedRealmSecret instanceof Promise
        ? await resolvedRealmSecret
        : resolvedRealmSecret;

    // Override secret
    // Order of priority: resolved realm secret > default global secret
    return realmSecret || this.keycloakOpts.secret;
  }
}
