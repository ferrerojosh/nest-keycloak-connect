import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { KeycloakConnectOptionsFactory } from './keycloak-connect-options-factory.interface';
import { KeycloakConnectOptions } from './keycloak-connect-options.interface';
export interface KeycloakConnectModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    inject?: any[];
    useExisting?: Type<KeycloakConnectOptionsFactory>;
    useClass?: Type<KeycloakConnectOptionsFactory>;
    useFactory?: (...args: any[]) => Promise<KeycloakConnectOptions> | KeycloakConnectOptions;
}
