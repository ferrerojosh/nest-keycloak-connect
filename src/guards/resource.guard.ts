import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as KeycloakConnect from 'keycloak-connect';
import { KEYCLOAK_INSTANCE } from '../constants';
import { META_RESOURCE } from '../decorators/resource.decorator';
import { META_SCOPES } from '../decorators/scopes.decorator';
import { META_ENFORCER_CONFIG } from '../decorators/enforcer-config.decorator';

/**
 * This adds a resource guard, which is permissive.
 * Only controllers annotated with `@Resource` and methods with `@Scopes`
 * are handled by this guard.
 */
@Injectable()
export class ResourceGuard implements CanActivate {
  logger = new Logger(ResourceGuard.name);

  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private keycloak: KeycloakConnect.Keycloak,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceClass = this.reflector.get<string>(
      META_RESOURCE,
      context.getClass(),
    );
    const resourceHandler = this.reflector.get<string>(
      META_RESOURCE,
      context.getHandler(),
    );
    const enforcerConfig = this.reflector.get<KeycloakConnect.EnforcerOptions>(
      META_ENFORCER_CONFIG,
      context.getHandler(),
    );
    const scopes = this.reflector.get<string[]>(
      META_SCOPES,
      context.getHandler(),
    );

    // Handler priority, then class
    const resource = resourceHandler ?? resourceClass;

    // No resource given, since we are permissive, allow
    if (!resource) {
      return true;
    }

    this.logger.verbose(
      `Protecting resource '${resource}' with scopes: [ ${scopes} ]`,
    );

    // No scopes given, since we are permissive, allow
    if (!scopes) {
      return true;
    }

    // Build permissions
    const permissions = scopes.map(scope => `${resource}:${scope}`);

    const [request, response] = [
      context.switchToHttp().getRequest(),
      context.switchToHttp().getResponse(),
    ];

    const user = request.user?.preferred_username ?? 'user';

    const enforcerFn = createEnforcerContext(request, response);
    const isAllowed = await enforcerFn(
      this.keycloak,
      permissions,
      enforcerConfig,
    );

    // If statement for verbose logging only
    if (!isAllowed) {
      this.logger.verbose(`Resource '${resource}' denied to ${user}.`);
    } else {
      this.logger.verbose(`Resource '${resource}' granted to ${user}.`);
    }

    return isAllowed;
  }
}

const createEnforcerContext = (request: any, response: any) => (
  keycloak: KeycloakConnect.Keycloak,
  permissions: string[],
  resourceConfig: KeycloakConnect.EnforcerOptions,
) =>
  new Promise<boolean>((resolve, reject) =>
    keycloak.enforcer(permissions, resourceConfig)(
      request,
      response,
      (next: any) => {
        if (request.resourceDenied) {
          resolve(false);
        } else {
          resolve(true);
        }
      },
    ),
  );
