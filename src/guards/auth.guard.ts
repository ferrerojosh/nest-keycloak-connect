import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as KeycloakConnect from 'keycloak-connect';
import { KEYCLOAK_CONNECT_OPTIONS, KEYCLOAK_INSTANCE } from '../constants';
import {
  META_SKIP_AUTH,
  META_UNPROTECTED,
} from '../decorators/unprotected.decorator';
import { KeycloakConnectOptions } from '../interface/keycloak-connect-options.interface';
import { extractRequest } from '../util';

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

    // No jwt token given, immediate return
    if (isInvalidJwt) {
      throw new UnauthorizedException();
    }

    try {
      const result = await this.keycloak.grantManager.validateAccessToken(jwt);

      if (typeof result === 'string') {
        // Attach user info object
        request.user = await this.keycloak.grantManager.userInfo(jwt);
        // Attach raw access token JWT extracted from bearer/cookie
        request.accessTokenJWT = jwt;
        return true;
      }
    } catch (ex) {
      console.error(`Cannot validate access token: `, ex);
    }

    throw new UnauthorizedException();
  }

  private extractJwt(headers: { [key: string]: string }) {
    if (headers && !headers.authorization) {
      throw new UnauthorizedException();
    }

    const auth = headers.authorization.split(' ');

    // We only allow bearer
    if (auth[0].toLowerCase() !== 'bearer') {
      throw new UnauthorizedException();
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
