# Nest Keycloak Connect

An adapter for [keycloak-nodejs-connect](https://github.com/keycloak/keycloak-nodejs-connect).

## Features

- Protect your resources using [Keycloak's Authorization Services](https://www.keycloak.org/docs/latest/authorization_services/).
- Simply add `@Resource` and `@Scopes` in your controllers and you're good to go.
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
import { KeycloakConnectModule } from 'nest-keycloak-connect';

@Module({
  imports: [KeycloakConnectModule.register({})],
})
export class AppModule {}
```
