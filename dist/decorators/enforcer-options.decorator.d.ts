import * as KeycloakConnect from 'keycloak-connect';
export declare const META_ENFORCER_OPTIONS = "enforcer-options";
/**
 * Keycloak enforcer options
 * @param opts - enforcer options
 * @since 1.3.0
 */
export declare const EnforcerOptions: (opts: KeycloakConnect.EnforcerOptions) => import("@nestjs/common").CustomDecorator<string>;
