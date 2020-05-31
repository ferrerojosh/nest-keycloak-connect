import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as KeycloakConnect from 'keycloak-connect';
import { KEYCLOAK_INSTANCE } from '../constants';

// Temporary until keycloak-connect can have full typescript definitions
// This is as of version 9.0.0
declare module 'keycloak-connect' {
  interface Keycloak {
    enforcer(
      expectedPermissions: string | string[],
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
    const resource = this.reflector.get<string>('resource', context.getClass());
    const scopes = this.reflector.get<string[]>('scopes', context.getHandler());

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
      this.getRequest(context),
      context.switchToHttp().getResponse(),
    ];

    const user = request.user.preferred_username;

    const enforcerFn = createEnforcerContext(request, response);
    const isAllowed = await enforcerFn(this.keycloak, permissions);

    if (!isAllowed) {
      this.logger.verbose(`Resource '${resource}' denied to '${user}'.`);
      throw new ForbiddenException();
    }

    this.logger.verbose(`Resource '${resource}' granted to '${user}'.`);

    return true;
  }

  getRequest<T = any>(context: ExecutionContext): T {
    return context.switchToHttp().getRequest();
  }
}

const createEnforcerContext = (request: any, response: any) => (
  keycloak: KeycloakConnect.Keycloak,
  permissions: string[],
) =>
  new Promise<boolean>((resolve, reject) =>
    keycloak.enforcer(permissions)(request, response, (next: any) => {
      if (request.resourceDenied) {
        resolve(false);
      } else {
        resolve(true);
      }
    }),
  );
