import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as KeycloakConnect from 'keycloak-connect';
import { extractRequest } from '../util';
import { KEYCLOAK_INSTANCE } from '../constants';
import { META_ALLOW_ANY_ROLE } from '../decorators/allow-any-role.decorator';
import { META_ROLES } from '../decorators/roles.decorator';

/**
 * A permissive type of role guard. Roles are set via `@Roles` decorator.
 * @since 1.1.0
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private keycloak: KeycloakConnect.Keycloak,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>(
      META_ROLES,
      context.getHandler(),
    );
    const allowAnyRole = this.reflector.get<boolean>(
      META_ALLOW_ANY_ROLE,
      context.getHandler(),
    );

    // No roles given, since we are permissive, allow
    if (!roles) {
      return true;
    }

    // Extract request
    const [request] = extractRequest(context);
    const { accessTokenJWT } = request;

    if (!accessTokenJWT) {
      // No access token attached, auth guard should have attached the necessary token
      throw new UnauthorizedException(
        'Are you sure AuthGuard is first in the chain?',
      );
    }

    // Create grant
    const grant = await this.keycloak.grantManager.createGrant({
      access_token: accessTokenJWT,
    });

    // Grab access token from grant
    const accessToken: KeycloakConnect.Token = grant.access_token as any;

    return allowAnyRole
      ? roles.some(r => accessToken.hasRole(r))
      : roles.every(r => accessToken.hasRole(r));
  }
}
