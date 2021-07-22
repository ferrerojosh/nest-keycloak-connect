import { RoleMatchingMode } from '../constants';
export interface RoleDecoratorOptionsInterface {
    /**
     * The roles to match at the application/client, prefix any realm-level roles with "realm:" (i.e realm:admin)
     */
    roles: string[];
    /**
     * Role matching mode, defaults to {@link RoleMatchingMode.ANY}
     */
    mode?: RoleMatchingMode;
}
