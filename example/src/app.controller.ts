import { Controller, Get } from '@nestjs/common';
import {
  KeycloakUser,
  Public,
  Roles,
  RoleMatchingMode,
} from 'nest-keycloak-connect';

@Controller()
export class AppController {
  @Get()
  @Public()
  getHello(
    @KeycloakUser()
    user: any,
  ): string {
    if (user) {
      return `Hello ${user.preferred_username}`;
    } else {
      return 'Hello world!';
    }
  }

  @Get('private')
  getPrivate() {
    return 'Authenticated only!';
  }

  @Get('admin')
  @Roles({ roles: ['admin'], mode: RoleMatchingMode.ALL })
  adminRole() {
    return 'Admin only!';
  }
}
