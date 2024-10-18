import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as KeycloakConnect from 'keycloak-connect';
import {
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_COOKIE_DEFAULT,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_MULTITENANT_SERVICE,
  TokenValidation,
} from '../constants';
import { META_PUBLIC } from '../decorators/public.decorator';
import { KeycloakConnectConfig } from '../interface/keycloak-connect-options.interface';
import { KeycloakMultiTenantService } from '../services/keycloak-multitenant.service';
import {
  extractRequestAndAttachCookie,
  parseToken,
  useKeycloak,
} from '../util';

/**
 * An authentication guard. Will return a 401 unauthorized when it is unable to
 * verify the JWT token or Bearer header is missing.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
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
    const isPublic = this.reflector.getAllAndOverride<boolean>(META_PUBLIC, [
      context.getClass(),
      context.getHandler(),
    ]);

    // Extract request/response
    const cookieKey = this.keycloakOpts.cookieKey || KEYCLOAK_COOKIE_DEFAULT;
    const [request] = extractRequestAndAttachCookie(context, cookieKey);

    // if is not an HTTP request ignore this guard
    if (!request) {
      return true;
    }

    const jwt = this.extractJwt(request.headers);
    const isJwtEmpty = jwt === null || jwt === undefined;

    // Not a public route, require jwt
    if (!isPublic && isJwtEmpty) {
      this.logger.verbose('Empty jwt, unauthorized');
      throw new UnauthorizedException();
    }

    // Public route, no jwt sent
    if (isPublic && isJwtEmpty) {
      return true;
    }

    this.logger.verbose(`Validating jwt`, { jwt });

    const keycloak = await useKeycloak(
      request,
      jwt,
      this.singleTenant,
      this.multiTenant,
      this.keycloakOpts,
    );
    const isValidToken = await this.validateToken(keycloak, jwt);

    if (isValidToken) {
      // Attach user info object
      request.user = parseToken(jwt);
      // Attach raw access token JWT extracted from bearer/cookie
      request.accessToken = jwt;

      this.logger.verbose(`User authenticated`, { user: request.user });
      return true;
    }

    // Valid token should return, this time we warn
    if (isPublic) {
      this.logger.warn(`A jwt token was retrieved but failed validation.`, {
        jwt,
      });
      return true;
    }

    throw new UnauthorizedException();
  }

  private async validateToken(keycloak: KeycloakConnect.Keycloak, jwt: any) {
    const tokenValidation =
      this.keycloakOpts.tokenValidation || TokenValidation.ONLINE;

    const gm = keycloak.grantManager;
    let grant: KeycloakConnect.Grant;

    try {
      grant = await gm.createGrant({ access_token: jwt });
    } catch (ex) {
      this.logger.warn(`Cannot validate access token: ${ex}`);
      // It will fail to create grants on invalid access token (i.e expired or wrong domain)
      return false;
    }

    const token = grant.access_token;

    this.logger.verbose(
      `Using token validation method: ${tokenValidation.toUpperCase()}`,
    );

    try {
      let result: boolean | KeycloakConnect.Token;

      switch (tokenValidation) {
        case TokenValidation.ONLINE:
          result = await gm.validateAccessToken(token);
          return result === token;
        case TokenValidation.OFFLINE:
          result = await gm.validateToken(token, 'Bearer');
          return result === token;
        case TokenValidation.NONE:
          return true;
        default:
          this.logger.warn(`Unknown validation method: ${tokenValidation}`);
          return false;
      }
    } catch (ex) {
      this.logger.warn(`Cannot validate access token: ${ex}`);
    }

    return false;
  }

  private extractJwt(headers: { [key: string]: string }) {
    if (headers && !headers.authorization) {
      this.logger.verbose(`No authorization header`);
      return null;
    }

    const auth = headers.authorization.split(' ');

    // We only allow bearer
    if (auth[0].toLowerCase() !== 'bearer') {
      this.logger.verbose(`No bearer header`);
      return null;
    }

    return auth[1];
  }
}
