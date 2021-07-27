import { ConsoleLogger, DynamicModule, Logger, Module, Provider } from '@nestjs/common';
import KeycloakConnect from 'keycloak-connect';
import {
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_LOGGER,
  TokenValidation,
} from './constants';
import { KeycloakConnectModuleAsyncOptions } from './interface/keycloak-connect-module-async-options.interface';
import { KeycloakConnectOptionsFactory } from './interface/keycloak-connect-options-factory.interface';
import {
  KeycloakConnectConfig,
  KeycloakConnectOptions,
  NestKeycloakConfig,
} from './interface/keycloak-connect-options.interface';
import * as path from 'path';
import * as fs from 'fs';

export * from './constants';
export * from './decorators/authenticated-user.decorator';
export * from './decorators/enforcer-options.decorator';
export * from './decorators/resource.decorator';
export * from './decorators/roles.decorator';
export * from './decorators/scopes.decorator';
export * from './decorators/public.decorator';
export * from './guards/auth.guard';
export * from './guards/resource.guard';
export * from './guards/role.guard';

@Module({})
export class KeycloakConnectModule {
  private static logger = new Logger(KeycloakConnectModule.name);

  private static parseConfig(
    opts: KeycloakConnectOptions,
    config?: NestKeycloakConfig,
  ): KeycloakConnectConfig {
    if (typeof opts === 'string') {
      const configPath = path.join(process.cwd(), opts);
      const json = fs.readFileSync(configPath);
      const keycloakConfig = JSON.parse(json.toString());
      return Object.assign(keycloakConfig, config);
    }
    return opts;
  }

  /**
   * Register the `KeycloakConnect` module.
   * @param opts `keycloak.json` path in string or {@link NestKeycloakConfig} object.
   * @param config {@link NestKeycloakConfig} when using `keycloak.json` path, optional
   * @returns
   */
  public static register(
    opts: KeycloakConnectOptions,
    config?: NestKeycloakConfig,
  ): DynamicModule {
    const optsProvider = {
      provide: KEYCLOAK_CONNECT_OPTIONS,
      useValue: KeycloakConnectModule.parseConfig(opts, config),
    };

    return {
      module: KeycloakConnectModule,
      providers: [optsProvider, this.loggerProvider, this.keycloakProvider],
      exports: [optsProvider, this.loggerProvider, this.keycloakProvider],
    };
  }

  public static registerAsync(
    opts: KeycloakConnectModuleAsyncOptions,
  ): DynamicModule {
    const optsProvider = this.createConnectProviders(opts);

    return {
      module: KeycloakConnectModule,
      imports: opts.imports || [],
      providers: [optsProvider, this.loggerProvider, this.keycloakProvider],
      exports: [optsProvider, this.loggerProvider, this.keycloakProvider],
    };
  }

  private static createConnectProviders(
    options: KeycloakConnectModuleAsyncOptions,
  ): Provider {
    if (options.useExisting || options.useFactory) {
      return this.createConnectOptionsProvider(options);
    }

    // useClass
    return {
      provide: options.useClass,
      useClass: options.useClass,
    };
  }

  private static createConnectOptionsProvider(
    options: KeycloakConnectModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      // useFactory
      return {
        provide: KEYCLOAK_CONNECT_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    // useExisting
    return {
      provide: KEYCLOAK_CONNECT_OPTIONS,
      useFactory: async (optionsFactory: KeycloakConnectOptionsFactory) =>
        await optionsFactory.createKeycloakConnectOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }

  private static loggerProvider: Provider = {
    provide: KEYCLOAK_LOGGER,
    useFactory: (opts: KeycloakConnectOptions) => {
      if (typeof opts === 'string') {
        return new Logger(KeycloakConnect.name);
      }
      if (opts.useNestLogger) {
        return new Logger(KeycloakConnect.name);
      }
      return new ConsoleLogger(KeycloakConnect.name, {
        logLevels: opts.logLevels
      });
    },
    inject: [KEYCLOAK_CONNECT_OPTIONS],
  };

  private static keycloakProvider: Provider = {
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
}
