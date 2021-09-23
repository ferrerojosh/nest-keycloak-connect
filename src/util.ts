import { ContextType, ExecutionContext } from '@nestjs/common';

type GqlContextType = 'graphql' | ContextType;

export const extractRequest = (
  context: ExecutionContext,
): [any, any, string] => {
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
  } else if (context.getType() === 'ws') {
    const wsContext = context.switchToWs();
    const socket = wsContext.getClient();

    if (socket && socket.request) {
      // const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
      const wsRequest = socket.request;
      wsRequest.headers = socket.handshake?.headers;

      request = wsRequest;
      response = {};
    } else {
      throw new Error(
        `The express compatible 'request' was not found. Are you using 'ws'? Only Socket.IO platform is supported as native 'ws' cannot send headers.`,
      );
    }
  }

  return [request, response, context.getType()];
};

export const parseToken = (token: string): string => {
  const parts = token.split('.');
  return JSON.parse(Buffer.from(parts[1], 'base64').toString());
};
