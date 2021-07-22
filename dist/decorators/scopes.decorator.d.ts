export declare const META_SCOPES = "scopes";
/**
 * Keycloak Authorization Scopes.
 * @param scopes - scopes that are associated with the resource
 */
export declare const Scopes: (...scopes: string[]) => import("@nestjs/common").CustomDecorator<string>;
