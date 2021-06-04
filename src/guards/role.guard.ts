import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as KeycloakConnect from 'keycloak-connect';
import { KEYCLOAK_INSTANCE, KEYCLOAK_LOGGER, RoleMatchingMode } from '../constants';
import { META_ROLES } from '../decorators/roles.decorator';
import { KeycloakLogger } from '../logger';
import { extractRequest } from '../util';
import { RoleDecoratorOptionsInterface } from '../interface/role-decorator-options.interface';

/**
 * A permissive type of role guard. Roles are set via `@Roles` decorator.
 * @since 1.1.0
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private keycloak: KeycloakConnect.Keycloak,
    @Inject(KEYCLOAK_LOGGER)
    private logger: KeycloakLogger,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rolesMetaData = this.reflector.get<RoleDecoratorOptionsInterface>(
      META_ROLES,
      context.getHandler(),
    );

    if (!rolesMetaData || rolesMetaData.roles.length == 0) {
      return true;
    }

    if (rolesMetaData && !rolesMetaData.mode) {
      rolesMetaData.mode = RoleMatchingMode.ANY;
    }

    this.logger.verbose(`Roles: `, JSON.stringify(rolesMetaData.roles));

    // Extract request
    const [request] = extractRequest(context);
    const { accessTokenJWT } = request;

    if (!accessTokenJWT) {
      // No access token attached, auth guard should have attached the necessary token
      this.logger.warn(
        'No access token found in request, are you sure AuthGuard is first in the chain?',
      );
      return false;
    }

    // Create grant
    const grant = await this.keycloak.grantManager.createGrant({
      access_token: accessTokenJWT,
    });

    // Grab access token from grant
    const accessToken: KeycloakConnect.Token = grant.access_token as any;

    return rolesMetaData.mode === RoleMatchingMode.ANY
      ? rolesMetaData.roles.some(r => accessToken.hasRole(r))
      : rolesMetaData.roles.every(r => accessToken.hasRole(r));
  }
}
