import { Provider } from '@nestjs/common';
import * as fs from 'fs';
import KeycloakConnect from 'keycloak-connect';
import * as path from 'path';
import {
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_INSTANCE,
  TokenValidation,
} from './constants';
import {
  KeycloakConnectConfig,
  KeycloakConnectOptions,
  NestKeycloakConfig,
} from './interface/keycloak-connect-options.interface';
import { KeycloakConnectModule } from './keycloak-connect.module';

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
    const configPathRelative = path.join(__dirname, opts);
    const configPathRoot = path.join(process.cwd(), opts);

    let configPath: string;

    if (fs.existsSync(configPathRelative)) {
      configPath = configPathRelative;
    } else if (fs.existsSync(configPathRoot)) {
      configPath = configPathRoot;
    } else {
      throw new Error(
        `Cannot find files, looked in [ ${configPathRelative}, ${configPathRoot} ]`,
      );
    }

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
