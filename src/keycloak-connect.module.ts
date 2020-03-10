import { DynamicModule, Module, Provider } from '@nestjs/common';
import Keycloak from 'keycloak-connect';
import { KEYCLOAK_CONNECT_OPTIONS, KEYCLOAK_INSTANCE } from './constants';
import { KeycloakConnectModuleAsyncOptions } from './interface/keycloak-connect-module-async-options.interface';
import { KeycloakConnectOptionsFactory } from './interface/keycloak-connect-options-factory.interface';
import { KeycloakConnectOptions } from './interface/keycloak-connect-options.interface';

export * from './decorators/resource.decorator';
export * from './decorators/scopes.decorator';
export * from './guards/auth.guard';
export * from './guards/resource.guard';

@Module({})
export class KeycloakConnectModule {
  public static register(opts: KeycloakConnectOptions): DynamicModule {
    return {
      module: KeycloakConnectModule,
      providers: [
        {
          provide: KEYCLOAK_CONNECT_OPTIONS,
          useValue: opts,
        },
        this.keycloakProvider(),
      ],
    };
  }

  public static registerAsync(
    opts: KeycloakConnectModuleAsyncOptions,
  ): DynamicModule {
    return {
      module: KeycloakConnectModule,
      imports: opts.imports || [],
      providers: [this.createConnectProviders(opts), this.keycloakProvider()],
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

  private static keycloakProvider(): Provider {
    return {
      provide: KEYCLOAK_INSTANCE,
      useFactory: (opts: KeycloakConnectOptions) => {
        const keycloak: any = new Keycloak({}, opts);

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
}
