import { DynamicModule, Logger, Module, Provider } from '@nestjs/common';
import { KEYCLOAK_CONNECT_OPTIONS } from './constants';
import { KeycloakConnectModuleAsyncOptions } from './interface/keycloak-connect-module-async-options.interface';
import { KeycloakConnectOptionsFactory } from './interface/keycloak-connect-options-factory.interface';
import {
  KeycloakConnectOptions,
  NestKeycloakConfig,
} from './interface/keycloak-connect-options.interface';
import {
  createKeycloakConnectOptionProvider,
  keycloakProvider,
  loggerProvider,
} from './keycloak-connect.providers';
import { KeycloakMultiTenantService } from './services/keycloak-multitenant.service';

export * from './constants';
export * from './decorators/authenticated-user.decorator';
export * from './decorators/enforcer-options.decorator';
export * from './decorators/public.decorator';
export * from './decorators/resource.decorator';
export * from './decorators/roles.decorator';
export * from './decorators/scopes.decorator';
export * from './guards/auth.guard';
export * from './guards/resource.guard';
export * from './guards/role.guard';
export * from './interface/keycloak-connect-module-async-options.interface';
export * from './interface/keycloak-connect-options-factory.interface';
export * from './interface/keycloak-connect-options.interface';

@Module({})
export class KeycloakConnectModule {
  static logger = new Logger(KeycloakConnectModule.name);

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
    const keycloakConnectProviders = [
      createKeycloakConnectOptionProvider(opts, config),
      loggerProvider,
      keycloakProvider,
      KeycloakMultiTenantService,
    ];
    return {
      module: KeycloakConnectModule,
      providers: keycloakConnectProviders,
      exports: keycloakConnectProviders,
    };
  }

  public static registerAsync(
    opts: KeycloakConnectModuleAsyncOptions,
  ): DynamicModule {
    const optsProvider = this.createAsyncProviders(opts);

    return {
      module: KeycloakConnectModule,
      imports: opts.imports || [],
      providers: optsProvider,
      exports: optsProvider,
    };
  }

  private static createAsyncProviders(
    options: KeycloakConnectModuleAsyncOptions,
  ): Provider[] {
    const reqProviders = [
      this.createAsyncOptionsProvider(options),
      loggerProvider,
      keycloakProvider,
      KeycloakMultiTenantService,
    ];

    if (options.useExisting || options.useFactory) {
      return reqProviders;
    }

    return [
      ...reqProviders,
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: KeycloakConnectModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: KEYCLOAK_CONNECT_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: KEYCLOAK_CONNECT_OPTIONS,
      useFactory: async (optionsFactory: KeycloakConnectOptionsFactory) =>
        await optionsFactory.createKeycloakConnectOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
