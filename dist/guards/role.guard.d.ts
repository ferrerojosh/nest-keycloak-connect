import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as KeycloakConnect from 'keycloak-connect';
/**
 * A permissive type of role guard. Roles are set via `@Roles` decorator.
 * @since 1.1.0
 */
export declare class RoleGuard implements CanActivate {
    private keycloak;
    private logger;
    private readonly reflector;
    constructor(keycloak: KeycloakConnect.Keycloak, logger: Logger, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
