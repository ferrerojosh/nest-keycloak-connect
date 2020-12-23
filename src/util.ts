import { ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

export const extractRequest = (context: ExecutionContext): [any, any] => {
  let request: any, response: any;

  // Check if request is coming from graphql or http
  if (context.getType() === 'http') {
    // http request
    const httpContext = context.switchToHttp();

    request = httpContext.getRequest();
    response = httpContext.getResponse();
  } else if (context.getType<GqlContextType>() === 'graphql') {
    // graphql request
    const gqlContext = GqlExecutionContext.create(context).getContext();

    request = gqlContext.req;
    response = gqlContext.res;
  }

  return [request, response];
};
