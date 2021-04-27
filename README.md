# Nest Keycloak Connect

![License](https://badgen.net/npm/license/nest-keycloak-connect)
[![Package Version](https://badgen.net/npm/v/nest-keycloak-connect)](https://www.npmjs.com/package/nest-keycloak-connect)
[![Build Status](https://travis-ci.com/ferrerojosh/nest-keycloak-connect.svg?branch=master)](https://travis-ci.com/ferrerojosh/nest-keycloak-connect)
![Weekly Download](https://badgen.net/npm/dw/nest-keycloak-connect)
![Total Download](https://badgen.net/npm/dt/nest-keycloak-connect)

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
      logLevels: ['warn']
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

In your controllers, simply do:

```typescript
import { Resource, Roles, Scopes, AllowAnyRole, Unprotected, Public } from 'nest-keycloak-connect';
import { Controller, Get, Delete, Put, Post, Param } from '@nestjs/common';
import { Product } from './product';
import { ProductService } from './product.service';

@Controller()
@Resource(Product.name)
export class ProductController {
  constructor(private service: ProductService) {}

  // New in 1.2.0, allows you add unprotected/public routes
  @Get()
  @Unprotected() // Use `@Public` if the verb seems weird to you
  async findAll() {
    return await this.service.findAll();
  }

  // New in 1.1.0, allows you to set roles
  @Get()
  @Roles('master:admin', 'myrealm:admin', 'admin')
  // Optional, allows any role passed in `@Roles` to be permitted
  @AllowAnyRole()
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