import { ConsoleLogger, Logger, Provider } from '@nestjs/common';
import * as fs from 'fs';
import KeycloakConnect from 'keycloak-connect';
import * as path from 'path';
import {
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_LOGGER,
  TokenValidation,
} from './constants';
import {
  KeycloakConnectConfig,
  KeycloakConnectOptions,
  NestKeycloakConfig,
} from './interface/keycloak-connect-options.interface';
import { KeycloakConnectModule } from './keycloak-connect.module';

export const loggerProvider: Provider = {
  provide: KEYCLOAK_LOGGER,
  useFactory: (opts: KeycloakConnectOptions) => {
    if (typeof opts === 'string') {
      return new Logger(KeycloakConnect.name);
    }
    if (opts.useNestLogger) {
      return new Logger(KeycloakConnect.name);
    }
    return new ConsoleLogger(KeycloakConnect.name, {
      logLevels: opts.logLevels,
    });
  },
  inject: [KEYCLOAK_CONNECT_OPTIONS],
};

export const keycloakProvider: Provider = {
  provide: KEYCLOAK_INSTANCE,
  useFactory: (opts: KeycloakConnectOptions) => {
    const keycloakOpts: any = opts;
    const keycloak: any = new KeycloakConnect({}, keycloakOpts);

    // Warn if using token validation none
    if (
      typeof opts !== 'string' &&
      opts.tokenValidation &&
      opts.tokenValidation === TokenValidation.NONE
    ) {
      KeycloakConnectModule.logger.warn(
        `Token validation is disabled, please only do this on development/special use-cases.`,
      );
    }

    // Access denied is called, add a flag to request so our resource guard knows
    keycloak.accessDenied = (req: any, res: any, next: any) => {
      req.resourceDenied = true;
      next();
    };

    return keycloak;
  },
  inject: [KEYCLOAK_CONNECT_OPTIONS],
};

const parseConfig = (
  opts: KeycloakConnectOptions,
  config?: NestKeycloakConfig,
): KeycloakConnectConfig => {
  if (typeof opts === 'string') {
    const configPath = path.join(process.cwd(), opts);
    const json = fs.readFileSync(configPath);
    const keycloakConfig = JSON.parse(json.toString());
    return Object.assign(keycloakConfig, config);
  }
  return opts;
};

export const createKeycloakConnectOptionProvider = (
  opts: KeycloakConnectOptions,
  config?: NestKeycloakConfig,
) => {
  return {
    provide: KEYCLOAK_CONNECT_OPTIONS,
    useValue: parseConfig(opts, config),
  };
};
