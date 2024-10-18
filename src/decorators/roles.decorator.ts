import { SetMetadata } from '@nestjs/common';
import { RoleMatch } from '../constants';

export const META_ROLES = 'roles';
export const META_ROLE_MATCHING_MODE = 'role-matching-mode';

/**
 * Keycloak user roles.
 * @param roles - the roles to match
 * @since 2.0.0
 */
export const Roles = (...roles: string[]) => SetMetadata(META_ROLES, roles);

export const RoleMatchingMode = (mode: RoleMatch) =>
  SetMetadata(META_ROLE_MATCHING_MODE, mode);
