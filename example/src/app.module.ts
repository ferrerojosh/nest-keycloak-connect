import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  AuthGuard,
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    KeycloakConnectModule.register({
      authServerUrl: 'http://localhost:8080/auth',
      realm: 'nest-example',
      clientId: 'nest-api',
      secret: '05c1ff5e-f9ba-4622-98e3-c4c9d280546e',
      // optional if you want to retrieve JWT from cookie
      cookieKey: 'KEYCLOAK_JWT',
      logLevels: ['verbose']
    }),
    ProductModule,
  ],
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
  ],
  controllers: [AppController],
})
export class AppModule {}
