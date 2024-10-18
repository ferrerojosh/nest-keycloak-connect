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
  KEYCLOAK_COOKIE_DEFAULT,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_MULTITENANT_SERVICE,
  RoleMatchingMode,
  RoleMerge,
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
  private readonly logger = new Logger(RoleGuard.name);

  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private singleTenant: KeycloakConnect.Keycloak,
    @Inject(KEYCLOAK_CONNECT_OPTIONS)
    private keycloakOpts: KeycloakConnectConfig,
    @Inject(KEYCLOAK_MULTITENANT_SERVICE)
    private multiTenant: KeycloakMultiTenantService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roleMerge = this.keycloakOpts.roleMerge
      ? this.keycloakOpts.roleMerge
      : RoleMerge.OVERRIDE;

    const rolesMetaDatas: RoleDecoratorOptionsInterface[] = [];

    if (roleMerge == RoleMerge.ALL) {
      const mergedRoleMetaData = this.reflector.getAllAndMerge<
        RoleDecoratorOptionsInterface[]
      >(META_ROLES, [context.getClass(), context.getHandler()]);

      if (mergedRoleMetaData) {
        rolesMetaDatas.push(...mergedRoleMetaData);
      }
    } else if (roleMerge == RoleMerge.OVERRIDE) {
      const roleMetaData =
        this.reflector.getAllAndOverride<RoleDecoratorOptionsInterface>(
          META_ROLES,
          [context.getClass(), context.getHandler()],
        );

      if (roleMetaData) {
        rolesMetaDatas.push(roleMetaData);
      }
    } else {
      throw Error(`Unknown role merge: ${roleMerge}`);
    }

    const combinedRoles = rolesMetaDatas.flatMap((x) => x.roles);

    if (combinedRoles.length === 0) {
      return true;
    }

    // Use matching mode of first item
    const roleMetaData = rolesMetaDatas[0];
    const roleMatchingMode = roleMetaData.mode
      ? roleMetaData.mode
      : RoleMatchingMode.ANY;

    this.logger.verbose(`Using matching mode: ${roleMatchingMode}`);
    this.logger.verbose(`Roles: ${JSON.stringify(combinedRoles)}`);

    // Extract request
    const cookieKey = this.keycloakOpts.cookieKey || KEYCLOAK_COOKIE_DEFAULT;
    const [request] = extractRequest(context, cookieKey);
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
    const keycloak = await useKeycloak(
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
      roleMatchingMode === RoleMatchingMode.ANY
        ? combinedRoles.some((r) => accessToken.hasRole(r))
        : combinedRoles.every((r) => accessToken.hasRole(r));

    if (granted) {
      this.logger.verbose(`Resource granted due to role(s)`);
    } else {
      this.logger.verbose(`Resource denied due to mismatched role(s)`);
    }

    return granted;
  }
}
