<div align="center">
  
# Nest Keycloak Connect
  
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/ferrerojosh/nest-keycloak-connect?style=for-the-badge)
![GitHub License](https://img.shields.io/github/license/ferrerojosh/nest-keycloak-connect?style=for-the-badge)
  
![NPM Version](https://img.shields.io/npm/v/nest-keycloak-connect?style=for-the-badge)
![NPM dev or peer Dependency Version](https://img.shields.io/npm/dependency-version/nest-keycloak-connect/peer/%40nestjs%2Fcommon?style=for-the-badge)
![NPM dev or peer Dependency Version](https://img.shields.io/npm/dependency-version/nest-keycloak-connect/peer/keycloak-connect?style=for-the-badge)

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/ferrerojosh/nest-keycloak-connect/build.yml?style=for-the-badge)
![NPM Weekly Downloads](https://img.shields.io/npm/dw/nest-keycloak-connect?style=for-the-badge)
![NPM Total Downloads](https://img.shields.io/npm/dt/nest-keycloak-connect?style=for-the-badge)

An adapter for [keycloak-nodejs-connect](https://github.com/keycloak/keycloak-nodejs-connect)

</div>


## Features

- Protect your resources using [Keycloak's Authorization Services](https://www.keycloak.org/docs/latest/authorization_services/).
- Simply add `@Resource`, `@Scopes`, or `@Roles` in your controllers and you're good to go.
- Compatible with [Fastify](https://github.com/fastify/fastify) platform.

## Installation

### Yarn

```bash
yarn add nest-keycloak-connect keycloak-connect
```

### NPM

```bash
npm install nest-keycloak-connect keycloak-connect --save
```

## Getting Started

### Module registration

Registering the module:

```typescript
KeycloakConnectModule.register({
  authServerUrl: 'http://localhost:8080', // might be http://localhost:8080/auth for older keycloak versions
  realm: 'master',
  clientId: 'my-nestjs-app',
  secret: 'secret',
  policyEnforcement: PolicyEnforcementMode.PERMISSIVE, // optional
  tokenValidation: TokenValidation.ONLINE, // optional
});
```

Async registration is also available:

```typescript
KeycloakConnectModule.registerAsync({
  useExisting: KeycloakConfigService,
  imports: [ConfigModule],
});
```

#### KeycloakConfigService

```typescript
import { Injectable } from '@nestjs/common';
import {
  KeycloakConnectOptions,
  KeycloakConnectOptionsFactory,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';

@Injectable()
export class KeycloakConfigService implements KeycloakConnectOptionsFactory {
  createKeycloakConnectOptions(): KeycloakConnectOptions {
    return {
      authServerUrl: 'http://localhost:8080', // might be http://localhost:8080/auth for older keycloak versions
      realm: 'master',
      clientId: 'my-nestjs-app',
      secret: 'secret',
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      tokenValidation: TokenValidation.ONLINE,
    };
  }
}
```

You can also register by just providing the `keycloak.json` path and an optional module configuration:

```typescript
KeycloakConnectModule.register(`./keycloak.json`, {
  policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
  tokenValidation: TokenValidation.ONLINE,
});
```

### Guards

Register any of the guards either globally, or scoped in your controller.

#### Global registration using APP_GUARD token

**_NOTE: These are in order, see https://docs.nestjs.com/guards#binding-guards for more information._**

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
  {
    provide: APP_GUARD,
    useClass: ResourceGuard,
  },
  {
    provide: APP_GUARD,
    useClass: RoleGuard,
  },
];
```

#### Scoped registration

```typescript
@Controller('cats')
@UseGuards(AuthGuard, ResourceGuard)
export class CatsController {}
```

## What does these providers do ?

### AuthGuard

Adds an authentication guard, you can also have it scoped if you like (using regular `@UseGuards(AuthGuard)` in your controllers). By default, it will throw a 401 unauthorized when it is unable to verify the JWT token or `Bearer` header is missing.

### ResourceGuard

Adds a resource guard, which is permissive by default (can be configured see [options](#nest-keycloak-options)). Only controllers annotated with `@Resource` and methods with `@Scopes` are handled by this guard.

**_NOTE: This guard is not necessary if you are using role-based authorization exclusively. You can use role guard exclusively for that._**

### RoleGuard

Adds a role guard, **can only be used in conjunction with resource guard when enforcement policy is PERMISSIVE**, unless you only use role guard exclusively.
Permissive by default. Used by controller methods annotated with `@Roles` (matching can be configured)

## Configuring controllers

In your controllers, simply do:

```typescript
import {
  Resource,
  Roles,
  Scopes,
  Public,
  RoleMatchingMode,
} from 'nest-keycloak-connect';
import { Controller, Get, Delete, Put, Post, Param } from '@nestjs/common';
import { Product } from './product';
import { ProductService } from './product.service';

@Controller()
@Resource(Product.name)
export class ProductController {
  constructor(private service: ProductService) {}

  @Get()
  @Public()
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

## Decorators

Here is the decorators you can use in your controllers.

| Decorator          | Description                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| @AuthenticatedUser | Retrieves the current Keycloak logged-in user. (must be per method, unless controller is request scoped.) |
| @EnforcerOptions   | Keycloak enforcer options.                                                                                |
| @Public            | Allow any user to use the route.                                                                          |
| @Resource          | Keycloak application resource name.                                                                       |
| @Scopes            | Keycloak application scope name.                                                                          |
| @Roles             | Keycloak realm/application roles.                                                                         |

## Multi tenant configuration

Setting up for multi-tenant is configured as an option in your configuration:

```typescript
{
  authServerUrl: 'http://localhost:8180/auth',
  clientId: 'nest-api',
  secret: 'fallback', // will be used as fallback when resolver returns null
  multiTenant: {
    realmResolver: (request) => {
      return request.get('host').split('.')[0];
    },
    realmSecretResolver: (realm, request) => {
      const secrets = { master: 'secret', slave: 'password' };
      return secrets[realm];
    },
    realmAuthServerUrlResolver: (realm, request) => {
      const authServerUrls = { master: 'https://master.local/auth', slave: 'https://slave.local/auth' };
      return authServerUrls[realm];
    }
  }
}
```

## Configuration options

### Keycloak Options

For Keycloak options, refer to the official [keycloak-connect](https://github.com/keycloak/keycloak-nodejs-connect/blob/main/middleware/auth-utils/config.js) library.

### Nest Keycloak Options

| Option            | Description                                                              | Required | Default      |
| ----------------- | ------------------------------------------------------------------------ | -------- | ------------ |
| cookieKey         | Cookie Key                                                               | no       | KEYCLOAK_JWT |
| logLevels         | Built-in logger level (deprecated, will be removed in 2.0)               | no       | log          |
| useNestLogger     | Use the nest logger (deprecated, will be removed in 2.0)                 | no       | true         |
| policyEnforcement | Sets the policy enforcement mode                                         | no       | PERMISSIVE   |
| tokenValidation   | Sets the token validation method                                         | no       | ONLINE       |
| multiTenant       | Sets the options for [multi-tenant configuration](#multi-tenant-options) | no       | -            |
| roleMerge         | Sets the merge mode for @Role decorator                                  | no       | OVERRIDE     |

### Multi Tenant Options

| Option                     | Description                                                                                             | Required | Default |
| -------------------------- | ------------------------------------------------------------------------------------------------------- | -------- | ------- |
| resolveAlways              | Option to always resolve the realm and secret. Disabled by default.                                     | no       | false   |
| realmResolver              | A function that passes a request (from respective platform i.e express or fastify) and returns a string | yes      | -       |
| realmSecretResolver        | A function that passes the realm string, and an optional request and returns the secret string          | no       | -       |
| realmAuthServerUrlResolver | A function that passes the realm string, and an optional request and returns the auth server url string | no       | -       |

## Example app

An [example application](example) is provided in the source code with both Keycloak Realm and Postman requests for you to experiment with.
