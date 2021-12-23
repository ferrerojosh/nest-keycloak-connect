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
   * Retrieves a keycloak instance based on the realm provided.
   * @param realm the realm to retrieve from
   * @returns the multi tenant keycloak instance
   */
  get(realm: string): KeycloakConnect.Keycloak {
    if (this.instances.has(realm)) {
      return this.instances.get(realm);
    } else {
      // TODO: Repeating code from  provider, will need to rework this in 2.0
      // Override realm
      const keycloakOpts: any = Object.assign(this.keycloakOpts, { realm });

      // Override secret
      const creds = keycloakOpts.credentials;
      if (
        creds !== undefined &&
        creds.realmSecretMap !== undefined &&
        creds.realmSecretMap.has(realm)
      ) {
        keycloakOpts.secret = keycloakOpts.credentials.realmSecretMap[realm];
      } // else it it will default to global secret

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
}
