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
  RoleMatch,
  RoleMerge,
} from '../constants';
import {
  META_ROLE_MATCHING_MODE,
  META_ROLES,
} from '../decorators/roles.decorator';
import { KeycloakConnectConfig } from '../interface/keycloak-connect-options.interface';
import { extractRequestAndAttachCookie, useKeycloak } from '../internal.util';
import { KeycloakMultiTenantService } from '../services/keycloak-multitenant.service';

/**
 * A permissive type of role guard. Roles are set via `@Roles` decorator.
 * @since 1.1.0
 */
@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);
  private readonly reflector = new Reflector();

  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private singleTenant: KeycloakConnect.Keycloak,
    @Inject(KEYCLOAK_CONNECT_OPTIONS)
    private keycloakOpts: KeycloakConnectConfig,
    @Inject(KEYCLOAK_MULTITENANT_SERVICE)
    private multiTenant: KeycloakMultiTenantService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roleMerge = this.keycloakOpts.roleMerge
      ? this.keycloakOpts.roleMerge
      : RoleMerge.OVERRIDE;

    const roles: string[] = [];

    const matchingMode = this.reflector.getAllAndOverride<RoleMatch>(
      META_ROLE_MATCHING_MODE,
      [context.getClass(), context.getHandler()],
    );

    if (roleMerge == RoleMerge.ALL) {
      const mergedRoles = this.reflector.getAllAndMerge<string[]>(META_ROLES, [
        context.getClass(),
        context.getHandler(),
      ]);

      if (mergedRoles) {
        roles.push(...mergedRoles);
      }
    } else if (roleMerge == RoleMerge.OVERRIDE) {
      const resultRoles = this.reflector.getAllAndOverride<string>(META_ROLES, [
        context.getClass(),
        context.getHandler(),
      ]);

      if (resultRoles) {
        roles.push(resultRoles);
      }
    } else {
      throw Error(`Unknown role merge: ${roleMerge}`);
    }

    if (roles.length === 0) {
      return true;
    }

    const roleMatchingMode = matchingMode ?? RoleMatch.ANY;

    this.logger.verbose(`Using matching mode: ${roleMatchingMode}`, { roles });

    // Extract request
    const cookieKey = this.keycloakOpts.cookieKey || KEYCLOAK_COOKIE_DEFAULT;
    const [request] = extractRequestAndAttachCookie(context, cookieKey);
    const { accessToken } = request;

    // if is not an HTTP request ignore this guard
    if (!request) {
      return true;
    }

    if (!accessToken) {
      // No access token attached, auth guard should have attached the necessary token
      this.logger.warn(
        'No access token found in request, are you sure AuthGuard is first in the chain?',
      );
      return false;
    }

    // Create grant
    const keycloak = await useKeycloak(
      request,
      request.accessToken,
      this.singleTenant,
      this.multiTenant,
      this.keycloakOpts,
    );
    const grant = await keycloak.grantManager.createGrant({
      access_token: accessToken,
    });

    // Grab access token from grant
    const grantAccessToken: KeycloakConnect.Token = grant.access_token as any;

    // For verbose logging, we store it instead of returning it immediately
    const granted =
      roleMatchingMode === RoleMatch.ANY
        ? roles.some((r) => grantAccessToken.hasRole(r))
        : roles.every((r) => grantAccessToken.hasRole(r));

    if (granted) {
      this.logger.verbose(`Resource granted due to role(s)`);
    } else {
      this.logger.verbose(`Resource denied due to mismatched role(s)`);
    }

    return granted;
  }
}
