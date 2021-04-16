import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as KeycloakConnect from 'keycloak-connect';
import { KEYCLOAK_INSTANCE, KEYCLOAK_LOGGER } from '../constants';
import { META_ENFORCER_OPTIONS } from '../decorators/enforcer-options.decorator';
import { META_RESOURCE } from '../decorators/resource.decorator';
import { META_SCOPES } from '../decorators/scopes.decorator';
import { META_UNPROTECTED } from '../decorators/unprotected.decorator';
import { KeycloakLogger } from '../logger';
import { extractRequest } from '../util';

/**
 * This adds a resource guard, which is permissive.
 * Only controllers annotated with `@Resource` and methods with `@Scopes`
 * are handled by this guard.
 */
@Injectable()
export class ResourceGuard implements CanActivate {
  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private keycloak: KeycloakConnect.Keycloak,
    @Inject(KEYCLOAK_LOGGER)
    private logger: KeycloakLogger,
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
    const enforcerOpts = this.reflector.getAllAndOverride<
      KeycloakConnect.EnforcerOptions
    >(META_ENFORCER_OPTIONS, [context.getClass(), context.getHandler()]);

    // No resource given, since we are permissive, allow
    if (!resource) {
      this.logger.verbose(
        `Controller has no @Resource defined, request allowed`,
      );
      return true;
    }

    // No scopes given, since we are permissive, allow
    if (!scopes) {
      this.logger.verbose(`Route has no @Scope defined, request allowed`);
      return true;
    }

    this.logger.verbose(
      `Protecting resource [ ${resource} ] with scopes: [ ${scopes} ]`,
    );

    // Build permissions
    const permissions = scopes.map(scope => `${resource}:${scope}`);
    // Extract request/response
    const [request, response] = extractRequest(context);

    if (!request.user && isUnprotected) {
      this.logger.verbose(`Route has no user, and is public, allowed`);
      return true;
    }

    const user = request.user?.preferred_username ?? 'user';

    const enforcerFn = createEnforcerContext(request, response, enforcerOpts);
    const isAllowed = await enforcerFn(this.keycloak, permissions);

    // If statement for verbose logging only
    if (!isAllowed) {
      this.logger.verbose(`Resource [ ${resource} ] denied to [ ${user} ]`);
    } else {
      this.logger.verbose(`Resource [ ${resource} ] granted to [ ${user} ]`);
    }

    return isAllowed;
  }
}

const createEnforcerContext = (
  request: any,
  response: any,
  options?: KeycloakConnect.EnforcerOptions,
) => (keycloak: KeycloakConnect.Keycloak, permissions: string[]) =>
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
