import { RoleDecoratorOptionsInterface } from '../interface/role-decorator-options.interface';
export declare const META_ROLES = "roles";
/**
 * Keycloak user roles.
 * @param roleMetaData - meta data for roles and matching mode
 * @since 1.1.0
 */
export declare const Roles: (roleMetaData: RoleDecoratorOptionsInterface) => import("@nestjs/common").CustomDecorator<string>;
