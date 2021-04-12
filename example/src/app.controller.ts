import { Controller, Get } from '@nestjs/common';
import { AuthenticatedUser, Public } from 'nest-keycloak-connect';

@Controller()
export class AppController {
  @Get()
  @Public(false)
  getHello(
    @AuthenticatedUser()
    user: any,
  ): string {
    if (user) {
      return `Hello ${user.preferred_username}`;
    } else {
      return 'Hello world!';
    }
  }
}
