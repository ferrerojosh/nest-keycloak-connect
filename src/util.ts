import { ContextType, ExecutionContext } from '@nestjs/common';
import KeycloakConnect from 'keycloak-connect';
import { KeycloakConnectConfig } from './interface/keycloak-connect-options.interface';
import { KeycloakMultiTenantService } from './services/keycloak-multitenant.service';

type GqlContextType = 'graphql' | ContextType;

// Confusing and all, but I needed to extract this fn to avoid more repeating code
// TODO: Rework in 2.0
export const useKeycloak = async (
  request: any,
  jwt: string,
  singleTenant: KeycloakConnect.Keycloak,
  multiTenant: KeycloakMultiTenantService,
  opts: KeycloakConnectConfig,
): Promise<KeycloakConnect.Keycloak> => {
  if (opts.multiTenant && opts.multiTenant.realmResolver) {
    const resolvedRealm = opts.multiTenant.realmResolver(request);
    const realm =
      resolvedRealm instanceof Promise ? await resolvedRealm : resolvedRealm;
    return await multiTenant.get(realm, request);
  } else if (!opts.realm) {
    const payload = parseToken(jwt);
    const issuerRealm = payload.iss.split('/').pop();
    return await multiTenant.get(issuerRealm, request);
  }
  return singleTenant;
};

export const attachCookieToHeader = (request: any, cookieKey: string) => {
  // Attach cookie as authorization header
  if (request && request.cookies && request.cookies[cookieKey]) {
    request.headers.authorization = `Bearer ${request.cookies[cookieKey]}`;
  }

  return request;
};

export const extractRequest = (context: ExecutionContext): [any, any] => {
  let request: any, response: any;

  // Check if request is coming from graphql or http
  if (context.getType() === 'http') {
    // http request
    const httpContext = context.switchToHttp();

    request = httpContext.getRequest();
    response = httpContext.getResponse();
  } else if (context.getType<GqlContextType>() === 'graphql') {
    let gql: any;
    // Check if graphql is installed
    try {
      gql = require('@nestjs/graphql');
    } catch (er) {
      throw new Error('@nestjs/graphql is not installed, cannot proceed');
    }

    // graphql request
    const gqlContext = gql.GqlExecutionContext.create(context).getContext();

    request = gqlContext.req;
    response = gqlContext.res;
  }

  return [request, response];
};

export const extractRequestAndAttachCookie = (
  context: ExecutionContext,
  cookieKey: string,
) => {
  const [tmpRequest, response] = extractRequest(context);
  const request = attachCookieToHeader(tmpRequest, cookieKey);

  return [request, response];
};

export const parseToken = (token: string): any => {
  const parts = token.split('.');
  return JSON.parse(Buffer.from(parts[1], 'base64').toString());
};
