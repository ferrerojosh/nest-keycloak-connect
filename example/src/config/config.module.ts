import { Module } from '@nestjs/common';
import { KeycloakConfigService } from './keycloak-config.service';

@Module({
  providers: [KeycloakConfigService],
  exports: [KeycloakConfigService],
})
export class ConfigModule {}
