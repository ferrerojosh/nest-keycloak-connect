import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as KeycloakConnect from 'keycloak-connect';
import {
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_LOGGER,
  RoleMatchingMode,
} from '../constants';
import { META_ROLES } from '../decorators/roles.decorator';
import { KeycloakConnectConfig } from '../interface/keycloak-connect-options.interface';
import { RoleDecoratorOptionsInterface } from '../interface/role-decorator-options.interface';
import { KeycloakMultiTenantService } from '../services/keycloak-multitenant.service';
import { extractRequest, useKeycloak } from '../util';

/**
 * A permissive type of role guard. Roles are set via `@Roles` decorator.
 * @since 1.1.0
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private singleTenant: KeycloakConnect.Keycloak,
    @Inject(KEYCLOAK_CONNECT_OPTIONS)
    private keycloakOpts: KeycloakConnectConfig,
    @Inject(KEYCLOAK_LOGGER)
    private logger: Logger,
    private multiTenant: KeycloakMultiTenantService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rolesMetaData = this.reflector.getAllAndOverride<
      RoleDecoratorOptionsInterface
    >(META_ROLES, [context.getClass(), context.getHandler()]);

    if (!rolesMetaData || rolesMetaData.roles.length === 0) {
      return true;
    }

    if (rolesMetaData && !rolesMetaData.mode) {
      rolesMetaData.mode = RoleMatchingMode.ANY;
    }

    const rolesStr = JSON.stringify(rolesMetaData.roles);
    this.logger.verbose(`Roles: ${rolesStr}`);

    // Extract request
    const [request] = extractRequest(context);
    const { accessTokenJWT } = request;

    // if is not an HTTP request ignore this guard
    if (!request) {
      return true;
    }

    if (!accessTokenJWT) {
      // No access token attached, auth guard should have attached the necessary token
      this.logger.warn(
        'No access token found in request, are you sure AuthGuard is first in the chain?',
      );
      return false;
    }

    // Create grant
    const keycloak = useKeycloak(
      request,
      request.accessTokenJWT,
      this.singleTenant,
      this.multiTenant,
      this.keycloakOpts,
    );
    const grant = await keycloak.grantManager.createGrant({
      access_token: accessTokenJWT,
    });

    // Grab access token from grant
    const accessToken: KeycloakConnect.Token = grant.access_token as any;

    // For verbose logging, we store it instead of returning it immediately
    const granted =
      rolesMetaData.mode === RoleMatchingMode.ANY
        ? rolesMetaData.roles.some(r => accessToken.hasRole(r))
        : rolesMetaData.roles.every(r => accessToken.hasRole(r));

    if (granted) {
      this.logger.verbose(`Resource granted due to role(s)`);
    } else {
      this.logger.verbose(`Resource denied due to mismatched role(s)`);
    }

    return granted;
  }
}
