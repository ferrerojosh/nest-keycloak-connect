import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import KeycloakConnect from 'keycloak-connect';
import { KEYCLOAK_INSTANCE } from '../constants';

/**
 * An authentication guard. Will return a 401 unauthorized when it is unable to
 * verify the JWT token or Bearer header is missing.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private keycloak: KeycloakConnect.Keycloak,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const jwt = this.extractJwt(request.headers);
    const result = await this.keycloak.grantManager.validateAccessToken(jwt);

    if (typeof result === 'string') {
      // Attach user info object
      request.user = await this.keycloak.grantManager.userInfo(jwt);
      return true;
    }

    throw new UnauthorizedException();
  }

  extractJwt(headers: { [key: string]: string }) {
    if (!headers.authorization) {
      throw new UnauthorizedException();
    }

    const auth = headers.authorization.split(' ');

    // We only allow bearer
    if (auth[0].toLowerCase() !== 'bearer') {
      throw new UnauthorizedException();
    }

    return auth[1];
  }
}
