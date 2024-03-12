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
  KEYCLOAK_MULTITENANT_SERVICE,
  PolicyEnforcementMode,
} from '../constants';
import { META_ENFORCER_OPTIONS } from '../decorators/enforcer-options.decorator';
import { META_UNPROTECTED } from '../decorators/public.decorator';
import { META_RESOURCE } from '../decorators/resource.decorator';
import { META_SCOPES } from '../decorators/scopes.decorator';
import { KeycloakConnectConfig } from '../interface/keycloak-connect-options.interface';
import { KeycloakMultiTenantService } from '../services/keycloak-multitenant.service';
import { extractRequest, useKeycloak } from '../util';

/**
 * This adds a resource guard, which is policy enforcement by default is permissive.
 * Only controllers annotated with `@Resource` and methods with `@Scopes`
 * are handled by this guard.
 */
@Injectable()
export class ResourceGuard implements CanActivate {
  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private singleTenant: KeycloakConnect.Keycloak,
    @Inject(KEYCLOAK_CONNECT_OPTIONS)
    private keycloakOpts: KeycloakConnectConfig,
    @Inject(KEYCLOAK_LOGGER)
    private logger: Logger,
    @Inject(KEYCLOAK_MULTITENANT_SERVICE)
    private multiTenant: KeycloakMultiTenantService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get<string>(
      META_RESOURCE,
      context.getClass(),
    );
    const scopes = this.reflector.get<string[]>(
      META_SCOPES,
      context.getHandler(),
    );
    const isUnprotected = this.reflector.getAllAndOverride<boolean>(
      META_UNPROTECTED,
      [context.getClass(), context.getHandler()],
    );
    const enforcerOpts =
      this.reflector.getAllAndOverride<KeycloakConnect.EnforcerOptions>(
        META_ENFORCER_OPTIONS,
        [context.getClass(), context.getHandler()],
      );

    // Default to permissive
    const pem =
      this.keycloakOpts.policyEnforcement || PolicyEnforcementMode.PERMISSIVE;
    const shouldAllow = pem === PolicyEnforcementMode.PERMISSIVE;

    // No resource given, check policy enforcement mode
    if (!resource) {
      if (shouldAllow) {
        this.logger.verbose(
          `Controller has no @Resource defined, request allowed due to policy enforcement`,
        );
      } else {
        this.logger.verbose(
          `Controller has no @Resource defined, request denied due to policy enforcement`,
        );
      }
      return shouldAllow;
    }

    // No scopes given, check policy enforcement mode
    if (!scopes) {
      if (shouldAllow) {
        this.logger.verbose(
          `Route has no @Scope defined, request allowed due to policy enforcement`,
        );
      } else {
        this.logger.verbose(
          `Route has no @Scope defined, request denied due to policy enforcement`,
        );
      }
      return shouldAllow;
    }

    this.logger.verbose(
      `Protecting resource [ ${resource} ] with scopes: [ ${scopes} ]`,
    );

    // Build permissions
    const permissions = scopes.map((scope) => `${resource}:${scope}`);
    // Extract request/response
    const [request, response] = extractRequest(context);

    // if is not an HTTP request ignore this guard
    if (!request) {
      return true;
    }

    if (!request.user && isUnprotected) {
      this.logger.verbose(`Route has no user, and is public, allowed`);
      return true;
    }

    const user = request.user?.preferred_username ?? 'user';

    const enforcerFn = createEnforcerContext(request, response, enforcerOpts);
    const keycloak = await useKeycloak(
      request,
      request.accessTokenJWT,
      this.singleTenant,
      this.multiTenant,
      this.keycloakOpts,
    );
    const isAllowed = await enforcerFn(keycloak, permissions);

    // If statement for verbose logging only
    if (!isAllowed) {
      this.logger.verbose(`Resource [ ${resource} ] denied to [ ${user} ]`);
    } else {
      this.logger.verbose(`Resource [ ${resource} ] granted to [ ${user} ]`);
    }

    return isAllowed;
  }
}

const createEnforcerContext =
  (request: any, response: any, options?: KeycloakConnect.EnforcerOptions) =>
  (keycloak: KeycloakConnect.Keycloak, permissions: string[]) =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    new Promise<boolean>((resolve, _) =>
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      keycloak.enforcer(permissions, options)(request, response, (_: any) => {
        if (request.resourceDenied) {
          resolve(false);
        } else {
          resolve(true);
        }
      }),
    );
