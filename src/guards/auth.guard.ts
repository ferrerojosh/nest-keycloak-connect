import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as KeycloakConnect from 'keycloak-connect';

import { KEYCLOAK_INSTANCE, KEYCLOAK_CONNECT_OPTIONS } from '../constants';
import { KeycloakConnectOptions } from '../interface/keycloak-connect-options.interface';
import { META_UNPROTECTED } from '../decorators/unprotected.decorator';

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
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isUnprotected = this.reflector.get<boolean>(
      META_UNPROTECTED,
      context.getHandler(),
    );

    // If unprotected is set skip Keycloak authentication
    if (isUnprotected) {
      return true;
    }

    // check if request is coming from graphql or REST API
    let request
    if (context.switchToHttp().getRequest() != null) {
      request = context.switchToHttp().getRequest();
    } else { // if request is graphql
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    }
    const jwt =
      this.extractJwtFromCookie(request.cookies) ??
      this.extractJwt(request.headers);

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
      console.error(`validateAccessToken Error: `, ex);
    }

    throw new UnauthorizedException();
  }

  extractJwt(headers: { [key: string]: string }) {
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

  extractJwtFromCookie(cookies: { [key: string]: string }) {
    return cookies && cookies[this.keycloakOpts.cookieKey] || cookies && cookies.KEYCLOAK_JWT;
  }
}
