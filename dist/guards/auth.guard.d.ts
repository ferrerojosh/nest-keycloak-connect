import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as KeycloakConnect from 'keycloak-connect';
import { NestKeycloakConfig } from '../interface/keycloak-connect-options.interface';
/**
 * An authentication guard. Will return a 401 unauthorized when it is unable to
 * verify the JWT token or Bearer header is missing.
 */
export declare class AuthGuard implements CanActivate {
    private keycloak;
    private keycloakOpts;
    private logger;
    private readonly reflector;
    constructor(keycloak: KeycloakConnect.Keycloak, keycloakOpts: NestKeycloakConfig, logger: Logger, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private validateToken;
    private extractJwt;
    private extractJwtFromCookie;
}
