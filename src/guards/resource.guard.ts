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
import { KeycloakResourceConfig } from '../interface/keycloak-resource.config';
import { META_RESOURCE_CONFIG } from '../decorators/resource-config.decorator';

// Temporary until keycloak-connect can have full typescript definitions
// This is as of version 9.0.0
declare module 'keycloak-connect' {
  interface Keycloak {
    enforcer(
      expectedPermissions: string | string[],
      resourceConfig?: KeycloakResourceConfig,
    ): (req: any, res: any, next: any) => any;
  }
}

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
    const resourceConfig = this.reflector.get<KeycloakResourceConfig>(
      META_RESOURCE_CONFIG,
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
      resourceConfig,
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
  resourceConfig: KeycloakResourceConfig,
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
