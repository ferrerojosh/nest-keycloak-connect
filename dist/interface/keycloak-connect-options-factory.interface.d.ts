import { KeycloakConnectOptions } from './keycloak-connect-options.interface';
export interface KeycloakConnectOptionsFactory {
    createKeycloakConnectOptions(): Promise<KeycloakConnectOptions> | KeycloakConnectOptions;
}
