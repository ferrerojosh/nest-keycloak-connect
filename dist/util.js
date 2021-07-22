"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseToken = exports.extractRequest = void 0;
exports.extractRequest = (context) => {
    let request, response;
    // Check if request is coming from graphql or http
    if (context.getType() === 'http') {
        // http request
        const httpContext = context.switchToHttp();
        request = httpContext.getRequest();
        response = httpContext.getResponse();
    }
    else if (context.getType() === 'graphql') {
        let gql;
        // Check if graphql is installed
        try {
            gql = require('@nestjs/graphql');
        }
        catch (er) {
            throw new Error('@nestjs/graphql is not installed, cannot proceed');
        }
        // graphql request
        const gqlContext = gql.GqlExecutionContext.create(context).getContext();
        request = gqlContext.req;
        response = gqlContext.res;
    }
    return [request, response];
};
exports.parseToken = (token) => {
    const parts = token.split('.');
    return JSON.parse(Buffer.from(parts[1], 'base64').toString());
};
