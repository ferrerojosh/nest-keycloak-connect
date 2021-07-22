# Nest Keycloak Connect

![GitHub](https://img.shields.io/github/license/ferrerojosh/nest-keycloak-connect)
![npm](https://img.shields.io/npm/v/nest-keycloak-connect)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/nest-keycloak-connect/peer/@nestjs/common)
![npm (prod) dependency version](https://img.shields.io/npm/dependency-version/nest-keycloak-connect/keycloak-connect)
[![Build Status](https://travis-ci.com/ferrerojosh/nest-keycloak-connect.svg?branch=master)](https://travis-ci.com/ferrerojosh/nest-keycloak-connect)
![npm](https://img.shields.io/npm/dw/nest-keycloak-connect)
![npm](https://img.shields.io/npm/dt/nest-keycloak-connect)

> An adapter for [keycloak-nodejs-connect](https://github.com/keycloak/keycloak-nodejs-connect).

## Features

- Protect your resources using [Keycloak's Authorization Services](https://www.keycloak.org/docs/latest/authorization_services/).
- Simply add `@Resource`, `@Scopes`, or `@Roles` in your controllers and you're good to go.
- Compatible with [Fastify](https://github.com/fastify/fastify) platform.

## Installation

### Yarn

```bash
yarn add nest-keycloak-connect
```

### NPM

```bash
npm install nest-keycloak-connect --save
```

### Peer Dependencies

Install the correct versions of each package, which are listed by the command:
```bash
npm info "nest-keycloak-connect@latest" peerDependencies
```

Linux/OSX users can run

```bash
(
  export PKG=nest-keycloak-connect;
  npm info "$PKG@latest" peerDependencies --json | command sed 's/[\{\},]//g ; s/: /@/g' | xargs yarn add --dev "$PKG@latest"
)
```

You can also use [install-peerdeps](https://www.npmjs.com/package/install-peerdeps) tool for installing peer dependencies

## Getting Started

Register the module in app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  AuthGuard,
  PolicyEnforcementMode,
  TokenValidation
} from 'nest-keycloak-connect';

@Module({
  imports: [
    KeycloakConnectModule.register({
      authServerUrl: 'http://localhost:8080/auth',
      realm: 'master',
      clientId: 'my-nestjs-app',
      secret: 'secret',
      // optional if you want to retrieve JWT from cookie
      cookieKey: 'KEYCLOAK_JWT', 
      // optional loglevels. default is verbose
      logLevels: ['warn'],
      // optional useNestLogger, uses the logger from app.useLogger() implementation
      useNestLogger: false,
      // optional, already defaults to permissive
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      // optional, already defaults to online validation
      tokenValidation: TokenValidation.NONE,
    }),
  ],
  providers: [
    // These are in order, see https://docs.nestjs.com/guards#binding-guards
    // for more information

    // This adds a global level authentication guard, you can also have it scoped
    // if you like.
    //
    // Will return a 401 unauthorized when it is unable to
    // verify the JWT token or Bearer header is missing.
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // This adds a global level resource guard, which is permissive.
    // Only controllers annotated with @Resource and methods with @Scopes
    // are handled by this guard.
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    // New in 1.1.0
    // This adds a global level role guard, which is permissive.
    // Used by `@Roles` decorator with the optional `@AllowAnyRole` decorator for allowing any
    // specified role passed.
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
```

You can also register by just providing the `keycloak.json` path:
```typescript
KeycloakConnectModule.register(`./keycloak.json`, {
  cookieKey: 'KEYCLOAK_JWT',
  logLevels: ['verbose'],
  useNestLogger: false,
  policyEnforcement: PolicyEnforcementMode.ENFORCING,
  tokenValidation: TokenValidation.NONE,
})
```

In your controllers, simply do:

```typescript
import { Resource, Roles, Scopes, AllowAnyRole, Public, RoleMatchingMode } from 'nest-keycloak-connect';
import { Controller, Get, Delete, Put, Post, Param } from '@nestjs/common';
import { Product } from './product';
import { ProductService } from './product.service';

@Controller()
@Resource(Product.name)
export class ProductController {
  constructor(private service: ProductService) {}

  @Get()
  @Public() // Can also use `@Unprotected`
  async findAll() {
    return await this.service.findAll();
  }

  @Get()
  @Roles({ roles: ['admin', 'other'] })
  async findAllBarcodes() {
    return await this.service.findAllBarcodes();
  }

  @Get(':code')
  @Scopes('View')
  async findByCode(@Param('code') code: string) {
    return await this.service.findByCode(code);
  }

  @Post()
  @Scopes('Create')
  async create(@Body() product: Product) {
    return await this.service.create(product);
  }

  @Delete(':code')
  @Scopes('Delete')
  @Roles({ roles: ['admin', 'realm:sysadmin'], mode: RoleMatchingMode.ALL })
  async deleteByCode(@Param('code') code: string) {
    return await this.service.deleteByCode(code);
  }

  @Put(':code')
  @Scopes('Edit')
  async update(@Param('code') code: string, @Body() product: Product) {
    return await this.service.update(code, product);
  }
}
```
## Example app

An [example application](example) is provided in the source code with both Keycloak Realm and Postman requests for you to experiment with.
