import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as KeycloakConnect from 'keycloak-connect';
import { NestKeycloakConfig } from '../interface/keycloak-connect-options.interface';
/**
 * This adds a resource guard, which is policy enforcement by default is permissive.
 * Only controllers annotated with `@Resource` and methods with `@Scopes`
 * are handled by this guard.
 */
export declare class ResourceGuard implements CanActivate {
    private keycloak;
    private keycloakOpts;
    private logger;
    private readonly reflector;
    constructor(keycloak: KeycloakConnect.Keycloak, keycloakOpts: NestKeycloakConfig, logger: Logger, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
