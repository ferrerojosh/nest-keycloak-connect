import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as KeycloakConnect from 'keycloak-connect';
import {
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_LOGGER,
} from '../constants';
import {
  META_SKIP_AUTH,
  META_UNPROTECTED,
} from '../decorators/unprotected.decorator';
import { KeycloakConnectOptions } from '../interface/keycloak-connect-options.interface';
import { KeycloakLogger } from '../logger';
import { extractRequest, parseToken } from '../util';

/**
 * An authentication guard. Will return a 401 unauthorized when it is unable to
 * verify the JWT token or Bearer header is missing.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private keycloak: KeycloakConnect.Keycloak,
    @Inject(KEYCLOAK_CONNECT_OPTIONS)
    private keycloakOpts: KeycloakConnectOptions,
    @Inject(KEYCLOAK_LOGGER)
    private logger: KeycloakLogger,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isUnprotected = this.reflector.getAllAndOverride<boolean>(
      META_UNPROTECTED,
      [context.getClass(), context.getHandler()],
    );
    const skipAuth = this.reflector.getAllAndOverride<boolean>(META_SKIP_AUTH, [
      context.getClass(),
      context.getHandler(),
    ]);

    // If unprotected is set skip Keycloak authentication
    if (isUnprotected && skipAuth) {
      return true;
    }

    // Extract request/response
    const [request] = extractRequest(context);
    const jwt =
      this.extractJwtFromCookie(request.cookies) ??
      this.extractJwt(request.headers);
    const isInvalidJwt = jwt === null || jwt === undefined;

    // Invalid JWT, but skipAuth = false, isUnprotected = true allow fallback
    if (isInvalidJwt && !skipAuth && isUnprotected) {
      this.logger.verbose(
        'Invalid JWT, skipAuth disabled, and a publicly marked route, allowed for fallback',
      );
      return true;
    }

    // No jwt token given, immediate return
    if (isInvalidJwt) {
      this.logger.verbose('Invalid JWT, unauthorized');
      throw new UnauthorizedException();
    }

    this.logger.verbose(`User JWT: ${jwt}`);

    try {
      const result = await this.keycloak.grantManager.validateAccessToken(jwt);

      if (typeof result === 'string') {
        // Attach user info object
        request.user = parseToken(jwt);
        // Attach raw access token JWT extracted from bearer/cookie
        request.accessTokenJWT = jwt;

        this.logger.verbose(
          `Authenticated User: ${JSON.stringify(request.user)}`,
        );
        return true;
      }
    } catch (ex) {
      this.logger.warn(`Cannot validate access token: ${ex}`);
    }

    throw new UnauthorizedException();
  }

  private extractJwt(headers: { [key: string]: string }) {
    if (headers && !headers.authorization) {
      this.logger.verbose(`No authorization header`);
      return null;
    }

    const auth = headers.authorization.split(' ');

    // We only allow bearer
    if (auth[0].toLowerCase() !== 'bearer') {
      this.logger.verbose(`No bearer header`);
      return null;
    }

    return auth[1];
  }

  private extractJwtFromCookie(cookies: { [key: string]: string }) {
    return (
      (cookies && cookies[this.keycloakOpts.cookieKey]) ||
      (cookies && cookies.KEYCLOAK_JWT)
    );
  }
}
